/// <reference path="../../Scripts/Typings/jquery/jquery.d.ts"/>
/// <reference path="jquery.chatjs.interfaces.ts"/>
/// <reference path="jquery.chatjs.adapter.ts"/>
/// <reference path="jquery.chatjs.utils.ts"/>
/// <reference path="jquery.chatjs.window.ts"/>
/// <reference path="jquery.chatjs.userlist.ts"/>

interface JQueryStatic {
    chatFriendsWindow: (options: ChatFriendsWindowOptions) => ChatFriendsWindow;
}

class ChatFriendsWindowState {
    isMaximized: boolean;
}

class ChatFriendsWindowOptions {
    adapter: IAdapter;
    // the title for the friend list
    titleText: string;
    // room id
    roomId: number;
    // content height
    contentHeight: number;
    // whether or not this window is maximized
    isMaximized: boolean;
    // called when the user minimizes or maximizes the window
    onStateChanged: (isMaximized: boolean) => void;
    // number of pixel this window is far from the right edge
    offsetRight: number;
    // when the user clicks another user in the user list
    userClicked: (userId: number) => void;
    // current user id
    userId: number;
    emptyRoomText: string;
}

// window that contains a list of friends. This component is used as opposed to "jquery.chatjs.rooms". The "rooms" component
// should be used when the user has the ability to select rooms and broadcast them. The "friends window" is used when you want a 
// Facebook style friends list.
class ChatFriendsWindow implements IWindow<ChatFriendsWindowState> {
    constructor(options: ChatFriendsWindowOptions) {

        var defaultOptions = new ChatFriendsWindowOptions();
        defaultOptions.titleText = "Friends";
        defaultOptions.isMaximized = true;
        defaultOptions.offsetRight = 10;
        defaultOptions.emptyRoomText = "No users available for chatting.";

        this.options = $.extend({}, defaultOptions, options);
        
        this.options.adapter.server.enterRoom(this.options.roomId, () => {
            // loads the user list
        });

        var chatWindowOptions = new ChatWindowOptions();
        chatWindowOptions.title = this.options.titleText;
        chatWindowOptions.canClose = false;
        chatWindowOptions.height = 300;
        chatWindowOptions.isMaximized = this.options.isMaximized;

        chatWindowOptions.onMaximizedStateChanged = (chatWindow: ChatWindow, isMaximized: boolean) => {
            this.options.onStateChanged(isMaximized);
        };

        chatWindowOptions.onCreated = window => {
            // once the chat window is created, it's time to add content
            var userListOptions = new UserListOptions();
            userListOptions.adapter = this.options.adapter;
            userListOptions.roomId = this.options.roomId;
            userListOptions.userId = this.options.userId;
            userListOptions.height = this.options.contentHeight;
            userListOptions.excludeCurrentUser = true;
            userListOptions.emptyRoomText = this.options.emptyRoomText;
            userListOptions.userClicked = this.options.userClicked;
            window.$windowInnerContent.userList(userListOptions);
        };

        this.chatWindow = $.chatWindow(chatWindowOptions);
        this.chatWindow.setRightOffset(this.options.offsetRight);
    }

    focus() {
    }

    setRightOffset(offset: number): void {
        this.chatWindow.setRightOffset(offset);
    }

    getWidth(): number {
        return this.chatWindow.getWidth();
    }

    getState(): ChatFriendsWindowState {
        var state = new ChatFriendsWindowState();
        state.isMaximized = this.chatWindow.getState();
        return state;
    }

    setState(state: ChatFriendsWindowState) {
        this.chatWindow.setState(state.isMaximized);
    }

    options: ChatFriendsWindowOptions;
    chatWindow: ChatWindow;
}

$.chatFriendsWindow = options => {
    var friendsWindow = new ChatFriendsWindow(options);
    return friendsWindow;
};