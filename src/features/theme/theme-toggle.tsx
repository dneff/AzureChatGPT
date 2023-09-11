"use client";

import { Laptop2, Moon, Sun } from "lucide-react";
import { useTheme } from "next-themes";

import { Tabs, TabsList, TabsTrigger } from "../../components/ui/tabs";
import { ToolTip, ToolTipContent, ToolTipTrigger } from "../../components/ui/tooltip";



export function ThemeToggle() {
  const { setTheme, theme } = useTheme();
  return (
    <Tabs defaultValue={theme}>
      <TabsList className="grid grid-cols-3 items-stretch p-1 h-10">
        <TabsTrigger value="light" onClick={() => setTheme("light")}>
          <ToolTip>
            <ToolTipTrigger>
              <Sun size={18} />
            </ToolTipTrigger>
            <ToolTipContent>Light</ToolTipContent>
          </ToolTip>
        </TabsTrigger>
        <TabsTrigger value="dark" onClick={() => setTheme("dark")}>
          <ToolTip>
            <ToolTipTrigger>
              <Moon size={18} />
            </ToolTipTrigger>
            <ToolTipContent>Dark</ToolTipContent>
          </ToolTip>
        </TabsTrigger>
        <TabsTrigger value="system" onClick={() => setTheme("system")}>
          <ToolTip>
            <ToolTipTrigger>
                <Laptop2 size={18} />
            </ToolTipTrigger>
            <ToolTipContent>System</ToolTipContent>
          </ToolTip>
        </TabsTrigger>
      </TabsList>
    </Tabs>
  );
}
