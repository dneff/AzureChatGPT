"use client";
import { MenuItem } from "@/components/menu";
import { Button } from "@/components/ui/button";
import {
  ChatThreadModel,
  SoftDeleteChatThreadByID,
  updateChatThreadTitle,
  FindChatThreadByID
} from "@/features/chat/chat-thread-service";
import { FindAllChats } from "@/features/chat/chat-service";
import { MessageCircle, Trash, Pencil, Check, X } from "lucide-react";
import { useParams, useRouter } from "next/navigation";
import { FC, useState } from "react";
import { Input } from "@/components/ui/input";

interface Prop {
  menuItems: Array<ChatThreadModel>;
}

interface MenuItemProp {
  thread: ChatThreadModel;
  isSelected: boolean;
  sendData: (threadID: string) => void;
}

const EditableMenuItem: FC<MenuItemProp> = (props: MenuItemProp) => {
  const { thread, isSelected, sendData } = props;
  const [editable, setEditable] = useState(false);
  const [threadName, setThreadName] = useState(thread.name);
  if(isSelected && threadName == "new chat") {
    const refresher = async () => {
      const allChats = await FindAllChats(thread.id);
      // console.log(allChats);
      if(allChats.length > 0) {
        const newThread = await FindChatThreadByID(thread.id);
        // console.log(newThread);
        setThreadName(newThread[0].name);
        return;
      } 
      setTimeout(refresher, 3000);
    };
    setTimeout(refresher, 3000);
  }

  return (
    <MenuItem
          href={"/chat/" + thread.id}
          isSelected={isSelected}
          className="justify-between group/item"
          disabled = {editable}
      >
        <MessageCircle size={16} />
        { !editable && <>
    <span className="flex gap-2 items-center overflow-hidden flex-1">
      <span className="overflow-ellipsis truncate"> {threadName}</span>
    </span>
    <Button
      className="invisible  group-hover/item:visible"
      size={"sm"}
      variant={"ghost"}
      onClick={async (e) => {
        e.preventDefault();
        setEditable(true);
      }}
    >
      <Pencil size={16} />
    </Button>
    <Button
      className="invisible  group-hover/item:visible"
      size={"sm"}
      variant={"ghost"}
      onClick={async (e) => {
        e.preventDefault();
        const yesDelete = confirm(
          "Are you sure you want to delete this chat?"
        );
        if (yesDelete) {
          await sendData(thread.id);
        }
      }}
    >
      <Trash size={16} />
    </Button>
    </>}
    { editable && <form 
    className="flex"
    onSubmit={async (e) => {
      const form: HTMLElement = e.target as HTMLElement;
      const inputElement: HTMLInputElement = form.getElementsByTagName("input")[0] as HTMLInputElement;
      e.preventDefault();
      await updateChatThreadTitle(thread, thread.model, inputElement.value);
      setThreadName(inputElement.value);
      setEditable(false);
    }}>
      <span className="flex gap-2 items-center overflow-hidden flex-1">
      <input
        autoFocus
        defaultValue={threadName}
        className="flex h-8 w-full bg-transparent border-b border-b-primary focus-visible:outline-none shadow-sm resize-none py-4"
      >
      </input>
      </span> 
    <Button
      size={"sm"}
      variant={"ghost"}
      type="submit"
      // onClick={async (e) => {
      //   e.preventDefault();
      //   setEditable(false);
      // }}
    >
      <Check size={16} />
    </Button>
    <Button
      size={"sm"}
      variant={"ghost"}
      onClick={async (e) => {
        e.preventDefault();
        setEditable(false);
      }}
    >
      <X size={16} />
    </Button>  
    </form> }
      </MenuItem>
  );
}

export const MenuItems: FC<Prop> = (props) => {
  const { id } = useParams();
  const router = useRouter();

  const sendData = async (threadID: string) => {
    await SoftDeleteChatThreadByID(threadID);
    router.refresh();
    router.replace("/chat");
  };
  return (
    <>
      {props.menuItems.map((thread) => (
        <EditableMenuItem
          thread={thread}
          key={thread.id}
          isSelected={id === thread.id}
          sendData={sendData}
        ></EditableMenuItem>
      ))}
    </>
  );
};
