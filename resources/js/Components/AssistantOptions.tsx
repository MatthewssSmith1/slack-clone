import { useWorkspaceStore } from "@/stores/workspaceStore";
import { useUserStore } from "@/stores/userStore";
import { ChannelType } from "@/lib/utils";
import ChannelIcon from "./ChannelIcon";
import { Filter } from "lucide-react";
import { create } from "zustand";
import {
    Select,
    SelectContent,
    SelectGroup,
    SelectItem,
    SelectLabel,
    SelectSeparator,
    SelectTrigger,
    SelectValue,
} from "@/components/ui/select";
import { Checkbox } from "@/components/ui/checkbox";
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip";
import { Separator } from "@/components/ui/separator";

interface AssistantOptionsStore {
    channelId: number | null;
    userId: number | null;
    isPersona: boolean;
    setChannel: (channelId: number | null) => void;
    setUser: (userId: number | null) => void;
    setPersona: (isPersona: boolean) => void;
}

export const useAssistantOptionsStore = create<AssistantOptionsStore>((set, get) => ({
    channelId: null,
    userId: null,
    isPersona: false,
    setChannel: (channelId) => {
        const { userId, isPersona } = get();
        const { channels } = useWorkspaceStore.getState();

        if (channelId && userId) {
            const channel = channels.find(c => c.id === channelId);
            if (channel && !channel.user_ids.includes(userId)) {
                set({ channelId, userId: null, isPersona: false });
                return;
            }
        }

        set({ channelId, userId, isPersona });
    },
    setUser: (userId) => set((state) => ({ 
        channelId: state.channelId,
        userId, 
        isPersona: userId === null ? false : state.isPersona 
    })),
    setPersona: (isPersona) => set({ isPersona }),
}));

export default function AssistantOptions() {
    return (
        <div className="flex items-center gap-3">
            <Filter className="size-5 text-muted-foreground" />
            <ChannelSelect />
            <UserSelect />
            <PersonaCheckbox />
            <Separator orientation="vertical" className="h-6 opacity-30" />
            <VoiceCheckbox />
        </div>
    );
}

function ChannelSelect() {
    const { channels } = useWorkspaceStore();
    const { channelId, setChannel } = useAssistantOptionsStore();

    const publicChannels = channels.filter(c => c.channel_type === ChannelType.Public);
    const directMessages = channels.filter(c => c.channel_type === ChannelType.Direct);

    return (
        <Select 
            value={channelId?.toString() ?? "all"} 
            onValueChange={(value) => setChannel(value === "all" ? null : parseInt(value))}
        >
            <SelectTrigger className="w-[175px] select-none">
                <SelectValue placeholder="Select a channel" />
            </SelectTrigger>
            <SelectContent>
                <Option value="all" icon={ChannelType.All} label="All channels" />
                <SelectSeparator />
                <SelectGroup>
                    <SelectLabel>Public Channels</SelectLabel>
                    {publicChannels.map((channel) => (
                        <Option
                            key={channel.id}
                            value={channel.id.toString()}
                            icon={channel.channel_type}
                            label={channel.name}
                        />
                    ))}
                </SelectGroup>
                <SelectSeparator />
                <SelectGroup>
                    <SelectLabel>Direct Messages</SelectLabel>
                    {directMessages.map((channel) => (
                        <Option
                            key={channel.id}
                            value={channel.id.toString()}
                            icon={channel.channel_type}
                            label={channel.name}
                        />
                    ))}
                </SelectGroup>
            </SelectContent>
        </Select>
    );
}

function UserSelect() {
    const { channelId, userId, setUser } = useAssistantOptionsStore();
    const { channels } = useWorkspaceStore();
    const { users } = useUserStore();

    const authUserId = users.find(u => u.is_current)?.id;
    if (!authUserId) return null;

    const currentChannel = channelId 
        ? channels.find(c => c.id === channelId)
        : null;

    const availableUsers = currentChannel
        ? users.filter(user => currentChannel.user_ids.includes(user.id))
        : users;

    const allLabel = currentChannel?.channel_type === ChannelType.Direct ? "Both users" : "All users";

    return (
        <Select 
            value={userId?.toString() ?? "all"}
            onValueChange={(value) => setUser(value === "all" ? null : parseInt(value))}
        >
            <SelectTrigger className="w-[175px] select-none">
                <SelectValue placeholder="Select a user" />
            </SelectTrigger>
            <SelectContent>
                <Option value="all" icon={ChannelType.All} label={allLabel} />
                <SelectSeparator />
                <Option value={authUserId.toString()} icon={ChannelType.Direct} label="You" />
                {availableUsers
                    .filter(user => user.id !== authUserId)
                    .map((user) => (
                        <Option
                            key={user.id}
                            value={user.id.toString()}
                            icon={ChannelType.Direct}
                            label={user.name}
                        />
                    ))}
            </SelectContent>
        </Select>
    );
}

function Option({ label, value, icon }: { label: string; value: string; icon: ChannelType }) {
    return (
        <SelectItem value={value}>
            <div className="flex items-center gap-2">
                <ChannelIcon channelType={icon} />
                <span>{label}</span>
            </div>
        </SelectItem>
    );
}

function PersonaCheckbox() {
    const { isPersona, setPersona, userId } = useAssistantOptionsStore();

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className={`flex items-center gap-1.5 transition-opacity duration-200 ${!userId ? 'opacity-50 pointer-events-none' : ''}`}>
                        <Checkbox
                            id="persona"
                            checked={isPersona}
                            onCheckedChange={setPersona}
                        />
                        <label
                            htmlFor="persona"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none cursor-pointer"
                        >
                            Persona
                        </label>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>Respond as a digital twin of the selected user, rather than an objective third party</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
}

function VoiceCheckbox() {
    // const { isVoice, setVoice, userId } = useAssistantOptionsStore();

    return (
        <TooltipProvider>
            <Tooltip>
                <TooltipTrigger asChild>
                    <div className="flex items-center gap-1.5 transition-opacity duration-200">
                        <Checkbox
                            id="voice"
                            // checked={isVoice}
                            // onCheckedChange={setVoice}
                        />
                        <label
                            htmlFor="voice"
                            className="text-sm font-medium leading-none peer-disabled:cursor-not-allowed peer-disabled:opacity-70 select-none cursor-pointer"
                        >
                            Voice
                        </label>
                    </div>
                </TooltipTrigger>
                <TooltipContent>
                    <p>To be implemented</p>
                </TooltipContent>
            </Tooltip>
        </TooltipProvider>
    );
} 