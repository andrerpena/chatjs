/// <reference path="../../Scripts/Typings/jquery/jquery.d.ts"/>
/// <reference path="jquery.chatjs.interfaces.ts"/>
/// <reference path="jquery.chatjs.utils.ts"/>
/// <reference path="jquery.chatjs.adapter.ts"/>
/// <reference path="jquery.chatjs.window.ts"/>
/// <reference path="jquery.chatjs.messageboard.ts"/>

var PmWindowInfo = (function () {
    function PmWindowInfo() {
    }
    return PmWindowInfo;
})();

var PmWindowState = (function () {
    function PmWindowState() {
    }
    return PmWindowState;
})();

var ChatPmWindowOptions = (function () {
    function ChatPmWindowOptions() {
    }
    return ChatPmWindowOptions;
})();

// window that contains a conversation between users
var ChatPmWindow = (function () {
    function ChatPmWindow(options) {
        var _this = this;
        var defaultOptions = new ChatPmWindowOptions();
        defaultOptions.typingText = " is typing...";
        defaultOptions.isMaximized = true;
        defaultOptions.onCreated = function () {
        };
        defaultOptions.onClose = function () {
        };
        defaultOptions.chatJsContentPath = "/chatjs/";

        this.options = $.extend({}, defaultOptions, options);

        this.options.adapter.server.getUserInfo(this.options.otherUserId, function (userInfo) {
            var chatWindowOptions = new ChatWindowOptions();
            chatWindowOptions.title = userInfo.Name;
            chatWindowOptions.canClose = true;
            chatWindowOptions.isMaximized = _this.options.isMaximized;
            chatWindowOptions.onCreated = function (window) {
                var messageBoardOptions = new MessageBoardOptions();
                messageBoardOptions.adapter = _this.options.adapter;
                messageBoardOptions.userId = _this.options.userId;
                messageBoardOptions.height = 235;
                messageBoardOptions.otherUserId = _this.options.otherUserId;
                messageBoardOptions.chatJsContentPath = _this.options.chatJsContentPath;
                window.$windowInnerContent.messageBoard(messageBoardOptions);
                window.$windowInnerContent.addClass("pm-window");
            };
            chatWindowOptions.onClose = function () {
                _this.options.onClose(_this);
            };
            chatWindowOptions.onMaximizedStateChanged = function (chatPmWindow, isMaximized) {
                _this.options.onMaximizedStateChanged(_this, isMaximized);
            };
            _this.chatWindow = $.chatWindow(chatWindowOptions);
            _this.options.onCreated(_this);
        });
    }
    ChatPmWindow.prototype.focus = function () {
    };

    ChatPmWindow.prototype.setRightOffset = function (offset) {
        this.chatWindow.setRightOffset(offset);
    };

    ChatPmWindow.prototype.getWidth = function () {
        return this.chatWindow.getWidth();
    };

    ChatPmWindow.prototype.getState = function () {
        var state = new PmWindowState();
        state.isMaximized = this.chatWindow.getState();
        state.otherUserId = this.options.otherUserId;
        return state;
    };

    ChatPmWindow.prototype.setState = function (state) {
        // PmWindow ignores the otherUserId option while setting state
        this.chatWindow.setState(state.isMaximized);
    };
    return ChatPmWindow;
})();

$.chatPmWindow = function (options) {
    var pmWindow = new ChatPmWindow(options);
    return pmWindow;
};
//# sourceMappingURL=jquery.chatjs.pmwindow.js.map
