import { ChatMessageModel } from "@/features/chat/chat-service";
import { CosmosClient } from "@azure/cosmos";
import {
  AIMessage,
  BaseListChatMessageHistory,
  BaseMessage,
} from "langchain/schema";
import { nanoid } from "nanoid";
import {
  addChatMessage,
  getChatMessages,
  initChatContainer,
} from "./cosmosdb-chat-service";
import { mapStoredMessagesToChatMessages } from "./utils";

export interface CosmosDBClientConfig {
  db: string;
  container: string;
  endpoint: string;
  key: string;
  partitionKey: string;
}

export interface CosmosDBChatMessageHistoryFields {
  sessionId: string;
  userId: string;
  config: CosmosDBClientConfig;
  userEmail: string;
}

export class CosmosDBChatMessageHistory extends BaseListChatMessageHistory {
  lc_namespace = ["langchain", "stores", "message", "cosmosdb"];

  private config: CosmosDBClientConfig;

  private sessionId: string;
  private userId: string;
  private userEmail: string;
  private client: CosmosClient;

  constructor({ sessionId, userId, userEmail, config }: CosmosDBChatMessageHistoryFields) {
    super();
    this.sessionId = sessionId;
    this.userId = userId;
    this.userEmail = userEmail;
    this.config = config;
    const { endpoint, key } = config;
    this.client = new CosmosClient({ endpoint, key });
  }

  async getMessages(): Promise<BaseMessage[]> {
    const resources = await getChatMessages(this.sessionId);
    return mapStoredMessagesToChatMessages(resources);
  }

  async clear(): Promise<void> {
    const container = await this.getContainer();
    await container.delete();
  }

  protected async addMessage(message: BaseMessage) {
    const modelToSave: ChatMessageModel = {
      id: nanoid(),
      createdAt: new Date(),
      type: "CHAT_MESSAGE",
      isDeleted: false,
      content: message.content,
      role: message instanceof AIMessage ? "assistant" : "user",
      threadId: this.sessionId,
      userId: this.userId,
      userEmail: this.userEmail
    };

    await addChatMessage(modelToSave);
  }

  getContainer = async () => {
    return await initChatContainer(this.client, this.config);
  };
}
