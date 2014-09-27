/// <reference path="../../Scripts/Typings/jquery/jquery.d.ts"/>
/// <reference path="jquery.chatjs.interfaces.ts"/>
/// <reference path="jquery.chatjs.adapter.ts"/>
/// <reference path="jquery.chatjs.utils.ts"/>
/// <reference path="jquery.chatjs.window.ts"/>
/// <reference path="jquery.chatjs.userlist.ts"/>

var ChatFriendsWindowState = (function () {
    function ChatFriendsWindowState() {
    }
    return ChatFriendsWindowState;
})();

var ChatFriendsWindowOptions = (function () {
    function ChatFriendsWindowOptions() {
    }
    return ChatFriendsWindowOptions;
})();

// window that contains a list of friends. This component is used as opposed to "jquery.chatjs.rooms". The "rooms" component
// should be used when the user has the ability to select rooms and broadcast them. The "friends window" is used when you want a
// Facebook style friends list.
var ChatFriendsWindow = (function () {
    function ChatFriendsWindow(options) {
        var _this = this;
        var defaultOptions = new ChatFriendsWindowOptions();
        defaultOptions.titleText = "Friends";
        defaultOptions.isMaximized = true;
        defaultOptions.offsetRight = 10;
        defaultOptions.emptyRoomText = "No users available for chatting.";

        this.options = $.extend({}, defaultOptions, options);

        this.options.adapter.server.enterRoom(this.options.roomId, function () {
            // loads the user list
        });

        var chatWindowOptions = new ChatWindowOptions();
        chatWindowOptions.title = this.options.titleText;
        chatWindowOptions.canClose = false;
        chatWindowOptions.height = 300;
        chatWindowOptions.isMaximized = this.options.isMaximized;

        chatWindowOptions.onMaximizedStateChanged = function (chatWindow, isMaximized) {
            _this.options.onStateChanged(isMaximized);
        };

        chatWindowOptions.onCreated = function (window) {
            // once the chat window is created, it's time to add content
            var userListOptions = new UserListOptions();
            userListOptions.adapter = _this.options.adapter;
            userListOptions.roomId = _this.options.roomId;
            userListOptions.userId = _this.options.userId;
            userListOptions.height = _this.options.contentHeight;
            userListOptions.excludeCurrentUser = true;
            userListOptions.emptyRoomText = _this.options.emptyRoomText;
            userListOptions.userClicked = _this.options.userClicked;
            window.$windowInnerContent.userList(userListOptions);
        };

        this.chatWindow = $.chatWindow(chatWindowOptions);
        this.chatWindow.setRightOffset(this.options.offsetRight);
    }
    ChatFriendsWindow.prototype.focus = function () {
    };

    ChatFriendsWindow.prototype.setRightOffset = function (offset) {
        this.chatWindow.setRightOffset(offset);
    };

    ChatFriendsWindow.prototype.getWidth = function () {
        return this.chatWindow.getWidth();
    };

    ChatFriendsWindow.prototype.getState = function () {
        var state = new ChatFriendsWindowState();
        state.isMaximized = this.chatWindow.getState();
        return state;
    };

    ChatFriendsWindow.prototype.setState = function (state) {
        this.chatWindow.setState(state.isMaximized);
    };
    return ChatFriendsWindow;
})();

$.chatFriendsWindow = function (options) {
    var friendsWindow = new ChatFriendsWindow(options);
    return friendsWindow;
};
//# sourceMappingURL=jquery.chatjs.friendswindow.js.map
