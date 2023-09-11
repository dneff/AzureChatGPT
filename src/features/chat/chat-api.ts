import { LangChainStream, StreamingTextResponse } from "ai";
import { ConversationChain } from "langchain/chains";
import { ChatOpenAI } from "langchain/chat_models/openai";
import { BufferWindowMemory } from "langchain/memory";
import {
  ChatPromptTemplate,
  HumanMessagePromptTemplate,
  MessagesPlaceholder,
  SystemMessagePromptTemplate,
} from "langchain/prompts";
import { userHashedId, getUserId } from "../auth/helpers";
import { CosmosDBChatMessageHistory } from "../langchain/stores/cosmosdb";
import { PromptGPTProps, initAndGuardChatSession } from "./chat-api-helpers";

export const PromptGPT = async (props: PromptGPTProps) => {
  const { lastHumanMessage, id } = await initAndGuardChatSession(props);

  const { stream, handlers } = LangChainStream();

  const userId = await userHashedId();
  const userEmail = await getUserId();
  let azureOpenAIApiDeploymentName: string = process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME;
  if(props.model === "GPT-4") {
    azureOpenAIApiDeploymentName = process.env.AZURE_OPENAI_API_DEPLOYMENT_NAME_GPT4!;
  }
  const chat = new ChatOpenAI({
    temperature: 0,
    streaming: true,
    azureOpenAIApiDeploymentName,
  });

  const memory = new BufferWindowMemory({
    k: 100,
    returnMessages: true,
    memoryKey: "history",
    chatHistory: new CosmosDBChatMessageHistory({
      sessionId: id,
      userId: userId,
      userEmail: userEmail,
      config: {
        db: process.env.AZURE_COSMOSEDBDB_DB_NAME,
        container: process.env.AZURE_COSMOSEDBDB_CONTAINER_NAME,
        endpoint: process.env.AZURE_COSMOSEDB_URI,
        key: process.env.AZURE_COSMOSEDB_KEY,
        partitionKey: "id",
      },
    }),
  });

  const chatPrompt = ChatPromptTemplate.fromPromptMessages([
    SystemMessagePromptTemplate.fromTemplate(
      `-You are Azure ChatGPT who is a helpful AI Assistant.
      - You will provide clear and concise queries, and you will respond with polite and professional answers.
      - You will answer questions truthfully and accurately.`
    ),
    new MessagesPlaceholder("history"),
    HumanMessagePromptTemplate.fromTemplate("{input}"),
  ]);
  const chain = new ConversationChain({
    llm: chat,
    memory,
    prompt: chatPrompt,
  });

  chain.call({ input: lastHumanMessage.content }, [handlers]);

  return new StreamingTextResponse(stream);
};
