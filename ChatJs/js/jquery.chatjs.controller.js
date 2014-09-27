/// <reference path="../../Scripts/Typings/jquery/jquery.d.ts"/>
/// <reference path="../../Scripts/Typings/autosize/autosize.d.ts"/>
/// <reference path="jquery.chatjs.adapter.ts"/>
/// <reference path="jquery.chatjs.pmwindow.ts"/>
/// <reference path="jquery.chatjs.friendswindow.ts"/>


var ChatControllerOptions = (function () {
    function ChatControllerOptions() {
    }
    return ChatControllerOptions;
})();

var ChatJsState = (function () {
    function ChatJsState() {
        this.pmWindows = [];
        this.mainWindowState = new ChatFriendsWindowState();
    }
    return ChatJsState;
})();

var ChatController = (function () {
    function ChatController(options) {
        var _this = this;
        var defaultOptions = new ChatControllerOptions();
        defaultOptions.roomId = null;
        defaultOptions.friendsTitleText = "Friends";
        defaultOptions.availableRoomsText = "Available rooms";
        defaultOptions.typingText = " is typing...";
        defaultOptions.offsetRight = 10;
        defaultOptions.windowsSpacing = 5;
        defaultOptions.enableSound = true;
        defaultOptions.persistenceMode = "cookie";
        defaultOptions.persistenceCookieName = "chatjs";
        defaultOptions.chatJsContentPath = "/chatjs/";

        this.options = $.extend({}, defaultOptions, options);

        // check required properties
        if (!this.options.roomId)
            throw "Room id option is required";

        this.pmWindows = [];

        // getting the adapter started. You cannot call the adapter BEFORE this is done.
        this.options.adapter.init(function () {
            var state = _this.getState();

            // the controller must have a listener to the "messages-changed" event because it has to create
            // new PM windows when the user receives it
            _this.options.adapter.client.onMessagesChanged(function (message) {
                if (message.UserToId && message.UserToId == _this.options.userId && !_this.findPmWindowByOtherUserId(message.UserFromId)) {
                    _this.createPmWindow(message.UserFromId, true, true);
                }
            });

            // if the user is able to select rooms
            var friendsWindowOptions = new ChatFriendsWindowOptions();
            friendsWindowOptions.roomId = _this.options.roomId;
            friendsWindowOptions.adapter = _this.options.adapter;
            friendsWindowOptions.userId = _this.options.userId;
            friendsWindowOptions.offsetRight = _this.options.offsetRight;
            friendsWindowOptions.titleText = _this.options.friendsTitleText;
            friendsWindowOptions.isMaximized = state ? state.mainWindowState.isMaximized : true;

            // when the friends window changes state, we must save the state of the controller
            friendsWindowOptions.onStateChanged = function () {
                _this.saveState();
            };

            // when the user clicks another user, we must create a pm window
            friendsWindowOptions.userClicked = function (userId) {
                if (userId != _this.options.userId) {
                    // verify whether there's already a PM window for this user
                    var existingPmWindow = _this.findPmWindowByOtherUserId(userId);
                    if (existingPmWindow)
                        existingPmWindow.focus();
                    else
                        _this.createPmWindow(userId, true, true);
                }
            };

            _this.mainWindow = $.chatFriendsWindow(friendsWindowOptions);

            _this.setState(state);
        });

        // for debugging only
        window.chatJs = this;
    }
    // creates a new PM window for the given user
    ChatController.prototype.createPmWindow = function (otherUserId, isMaximized, saveState) {
        var _this = this;
        var chatPmOptions = new ChatPmWindowOptions();
        chatPmOptions.userId = this.options.userId;
        chatPmOptions.otherUserId = otherUserId;
        chatPmOptions.adapter = this.options.adapter;
        chatPmOptions.typingText = this.options.typingText;
        chatPmOptions.isMaximized = isMaximized;
        chatPmOptions.chatJsContentPath = this.options.chatJsContentPath;
        chatPmOptions.onCreated = function (pmWindow) {
            _this.pmWindows.push({
                otherUserId: otherUserId,
                conversationId: null,
                pmWindow: pmWindow
            });
            _this.organizePmWindows();
            if (saveState)
                _this.saveState();
        };
        chatPmOptions.onClose = function () {
            for (var i = 0; i < _this.pmWindows.length; i++)
                if (_this.pmWindows[i].otherUserId == otherUserId) {
                    _this.pmWindows.splice(i, 1);
                    _this.saveState();
                    _this.organizePmWindows();
                    break;
                }
        };
        chatPmOptions.onMaximizedStateChanged = function () {
            _this.saveState();
        };

        return $.chatPmWindow(chatPmOptions);
    };

    // saves the windows states
    ChatController.prototype.saveState = function () {
        var state = new ChatJsState();

        for (var i = 0; i < this.pmWindows.length; i++) {
            state.pmWindows.push({
                otherUserId: this.pmWindows[i].otherUserId,
                conversationId: null,
                isMaximized: this.pmWindows[i].pmWindow.getState().isMaximized
            });
        }

        // persist rooms state
        state.mainWindowState = this.mainWindow.getState();

        switch (this.options.persistenceMode) {
            case "cookie":
                this.createCookie(this.options.persistenceCookieName, state);
                break;
            case "server":
                throw "Server persistence is not supported yet";
            default:
                throw "Invalid persistence mode. Available modes are: cookie and server";
        }
        return state;
    };

    ChatController.prototype.getState = function () {
        var state;
        switch (this.options.persistenceMode) {
            case "cookie":
                state = this.readCookie(this.options.persistenceCookieName);
                break;
            case "server":
                throw "Server persistence is not supported yet";
            default:
                throw "Invalid persistence mode. Available modes are: cookie and server";
        }
        return state;
    };

    // loads the windows states
    ChatController.prototype.setState = function (state) {
        if (typeof state === "undefined") { state = null; }
        // if a state hasn't been passed in, gets the state. If it continues to be null/undefined, then there's nothing to be done.
        if (!state)
            state = this.getState();
        if (!state)
            return;

        for (var i = 0; i < state.pmWindows.length; i++) {
            var shouldCreatePmWindow = true;

            // if there's already a PM window for the given user, we'll not create it
            if (this.pmWindows.length) {
                for (var j = 0; j < this.pmWindows.length; j++) {
                    if (state.pmWindows[i].otherUserId && this.pmWindows[j].otherUserId == state.pmWindows[j].otherUserId) {
                        shouldCreatePmWindow = false;
                        break;
                    }
                }
            }

            if (shouldCreatePmWindow)
                this.createPmWindow(state.pmWindows[i].otherUserId, state.pmWindows[i].isMaximized, false);
        }

        this.mainWindow.setState(state.mainWindowState, false);
    };

    ChatController.prototype.eraseCookie = function (name) {
        this.createCookie(name, "", -1);
    };

    // reads a cookie. The cookie value will be converted to a JSON object if possible, otherwise the value will be returned as is
    ChatController.prototype.readCookie = function (name) {
        var nameEq = name + "=";
        var ca = document.cookie.split(';');
        var cookieValue;
        for (var i = 0; i < ca.length; i++) {
            var c = ca[i];
            while (c.charAt(0) == ' ')
                c = c.substring(1, c.length);
            if (c.indexOf(nameEq) == 0) {
                cookieValue = c.substring(nameEq.length, c.length);
            }
        }
        if (cookieValue) {
            try  {
                return JSON.parse(cookieValue);
            } catch (e) {
                return cookieValue;
            }
        } else
            return null;
    };

    // creates a cookie. The passed in value will be converted to JSON, if not a string
    ChatController.prototype.createCookie = function (name, value, days) {
        var stringedValue;
        if (typeof value == "string")
            stringedValue = value;
        else
            stringedValue = JSON.stringify(value);
        if (value)
            var expires;
        if (days) {
            var date = new Date();
            date.setTime(date.getTime() + (days * 24 * 60 * 60 * 1000));
            expires = "; expires=" + date.toUTCString();
        } else {
            expires = "";
        }
        document.cookie = name + "=" + stringedValue + expires + "; path=/";
    };

    ChatController.prototype.findPmWindowByOtherUserId = function (otherUserId) {
        for (var i = 0; i < this.pmWindows.length; i++)
            if (this.pmWindows[i].otherUserId == otherUserId)
                return this.pmWindows[i].pmWindow;
        return null;
    };

    // organizes the pm windows
    ChatController.prototype.organizePmWindows = function () {
        // this is the initial right offset
        var rightOffset = +this.options.offsetRight + this.mainWindow.getWidth() + this.options.windowsSpacing;
        for (var i = 0; i < this.pmWindows.length; i++) {
            this.pmWindows[i].pmWindow.setRightOffset(rightOffset);
            rightOffset += this.pmWindows[i].pmWindow.getWidth() + this.options.windowsSpacing;
        }
    };
    return ChatController;
})();

$.chat = function (options) {
    var chat = new ChatController(options);
    return chat;
};
//# sourceMappingURL=jquery.chatjs.controller.js.map
