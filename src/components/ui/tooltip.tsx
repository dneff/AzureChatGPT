"use client"

import * as React from "react";
import * as ToolTipPrimitive from "@radix-ui/react-tooltip";


const ToolTip = (props) => (<ToolTipPrimitive.Provider>
        <ToolTipPrimitive.Root  {...props}></ToolTipPrimitive.Root>
        </ToolTipPrimitive.Provider>);
const ToolTipTrigger = (props) => (<ToolTipPrimitive.Trigger asChild  {...props}/>);
const ToolTipContent = ({ children, ...props }) => (<ToolTipPrimitive.Portal>
                                        <ToolTipPrimitive.Content sideOffset={10} side="bottom" align="center"  alignOffset={10} {...props} className="text-sm">
                                            {children}
                                        </ToolTipPrimitive.Content>
                                    </ToolTipPrimitive.Portal>);

export { ToolTip, ToolTipTrigger, ToolTipContent }