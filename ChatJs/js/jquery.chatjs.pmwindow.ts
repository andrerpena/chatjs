/// <reference path="../../Scripts/Typings/jquery/jquery.d.ts"/>
/// <reference path="jquery.chatjs.interfaces.ts"/>
/// <reference path="jquery.chatjs.utils.ts"/>
/// <reference path="jquery.chatjs.adapter.ts"/>
/// <reference path="jquery.chatjs.window.ts"/>
/// <reference path="jquery.chatjs.messageboard.ts"/>

interface JQueryStatic {
    chatPmWindow: (options: ChatPmWindowOptions) => ChatPmWindow;
}

class PmWindowInfo {
    otherUserId: number;
    conversationId: number;
    pmWindow: ChatPmWindow;
}

class PmWindowState {
    otherUserId: number;
    conversationId: number;
    isMaximized: boolean;
}


class ChatPmWindowOptions {
    userId: number;
    otherUserId: number;
    conversationId: number;
    typingText: string;
    adapter: IAdapter;
    isMaximized: boolean;
    onCreated: (pmWindow: ChatPmWindow) => void;
    onClose: (pmWindow: ChatPmWindow) => void;
    onMaximizedStateChanged: (pmWindow: ChatPmWindow, isMaximized: boolean) => void;
    chatJsContentPath: string;
}

// window that contains a conversation between users
class ChatPmWindow implements IWindow<PmWindowState> {
    constructor(options: ChatPmWindowOptions) {

        var defaultOptions = new ChatPmWindowOptions();
        defaultOptions.typingText = " is typing...";
        defaultOptions.isMaximized = true;
        defaultOptions.onCreated = () => {};
        defaultOptions.onClose = () => { };
        defaultOptions.chatJsContentPath = "/chatjs/";

        this.options = $.extend({}, defaultOptions, options);

        this.options.adapter.server.getUserInfo(this.options.otherUserId, (userInfo: ChatUserInfo) => {

            var chatWindowOptions = new ChatWindowOptions();
            chatWindowOptions.title = userInfo.Name;
            chatWindowOptions.canClose = true;
            chatWindowOptions.isMaximized = this.options.isMaximized;
            chatWindowOptions.onCreated = (window: ChatWindow) => {
                var messageBoardOptions = new MessageBoardOptions();
                messageBoardOptions.adapter = this.options.adapter;
                messageBoardOptions.userId = this.options.userId;
                messageBoardOptions.height = 235;
                messageBoardOptions.otherUserId = this.options.otherUserId;
                messageBoardOptions.chatJsContentPath = this.options.chatJsContentPath;
                window.$windowInnerContent.messageBoard(messageBoardOptions);
                window.$windowInnerContent.addClass("pm-window");
            };
            chatWindowOptions.onClose = () => {
                this.options.onClose(this);
            }
            chatWindowOptions.onMaximizedStateChanged = (chatPmWindow, isMaximized) => {
                this.options.onMaximizedStateChanged(this, isMaximized);
            }
            this.chatWindow = $.chatWindow(chatWindowOptions);
            this.options.onCreated(this);
        });
    }

    focus() {
    }

    setRightOffset(offset: number): void {
        this.chatWindow.setRightOffset(offset);
    }

    getWidth(): number {
        return this.chatWindow.getWidth();
    }

    getState(): PmWindowState {
        var state = new PmWindowState();
        state.isMaximized = this.chatWindow.getState();
        state.otherUserId = this.options.otherUserId;
        return state;
    }

    setState(state: PmWindowState) {
        // PmWindow ignores the otherUserId option while setting state
        this.chatWindow.setState(state.isMaximized);
    }

    options: ChatPmWindowOptions;
    chatWindow: ChatWindow;
}

$.chatPmWindow = options => {
    var pmWindow = new ChatPmWindow(options);
    return pmWindow;
};