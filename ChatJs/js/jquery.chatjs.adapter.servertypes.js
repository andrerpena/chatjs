var ChatMessageInfo = (function () {
    function ChatMessageInfo() {
    }
    return ChatMessageInfo;
})();

var UserStatusType;
(function (UserStatusType) {
    UserStatusType[UserStatusType["Offline"] = 0] = "Offline";
    UserStatusType[UserStatusType["Online"] = 1] = "Online";
})(UserStatusType || (UserStatusType = {}));

/// <summary>
/// Information about a chat user
/// </summary>
var ChatUserInfo = (function () {
    /// User chat status. For now, it only supports online and offline
    function ChatUserInfo() {
    }
    return ChatUserInfo;
})();

var ChatRoomInfo = (function () {
    function ChatRoomInfo() {
    }
    return ChatRoomInfo;
})();

var ChatTypingSignalInfo = (function () {
    function ChatTypingSignalInfo() {
    }
    return ChatTypingSignalInfo;
})();

var ChatUserListChangedInfo = (function () {
    function ChatUserListChangedInfo() {
    }
    return ChatUserListChangedInfo;
})();

var ChatRoomListChangedInfo = (function () {
    function ChatRoomListChangedInfo() {
    }
    return ChatRoomListChangedInfo;
})();
//# sourceMappingURL=jquery.chatjs.adapter.servertypes.js.map
