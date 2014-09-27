/// <reference path="../../Scripts/Typings/jquery/jquery.d.ts"/>
/// <reference path="jquery.chatjs.interfaces.ts"/>
/// <reference path="jquery.chatjs.utils.ts"/>
/// <reference path="jquery.chatjs.adapter.ts"/>
/// <reference path="jquery.chatjs.window.ts"/>
/// <reference path="jquery.chatjs.messageboard.ts"/>

var UserListOptions = (function () {
    function UserListOptions() {
    }
    return UserListOptions;
})();

var UserList = (function () {
    function UserList(jQuery, options) {
        var _this = this;
        this.$el = jQuery;

        var defaultOptions = new UserListOptions();
        defaultOptions.emptyRoomText = "No users available for chatting.";
        defaultOptions.height = 100;
        defaultOptions.excludeCurrentUser = false;
        defaultOptions.userClicked = function () {
        };

        this.options = $.extend({}, defaultOptions, options);

        this.$el.addClass("user-list");

        ChatJsUtils.setOuterHeight(this.$el, this.options.height);

        // when the user list changed, this list must be updated
        this.options.adapter.client.onUserListChanged(function (userListData) {
            if ((_this.options.roomId && userListData.RoomId == _this.options.roomId) || (_this.options.conversationId && _this.options.conversationId == userListData.ConversationId)) {
                var userList = userListData.UserList;
                _this.populateList(userList);
            }
        });

        // loads the list now
        this.options.adapter.server.getUserList(this.options.roomId, this.options.conversationId, function (userList) {
            _this.populateList(userList);
        });
    }
    UserList.prototype.populateList = function (rawUserList) {
        var _this = this;
        // this will copy the list to a new array
        var userList = rawUserList.slice(0);

        if (this.options.excludeCurrentUser) {
            var j = 0;
            while (j < userList.length) {
                if (userList[j].Id == this.options.userId)
                    userList.splice(j, 1);
                else
                    j++;
            }
        }

        this.$el.html('');
        if (userList.length == 0) {
            $("<div/>").addClass("user-list-empty").text(this.options.emptyRoomText).appendTo(this.$el);
        } else {
            for (var i = 0; i < userList.length; i++) {
                var $userListItem = $("<div/>").addClass("user-list-item").attr("data-val-id", userList[i].Id).appendTo(this.$el);

                $("<img/>").addClass("profile-picture").attr("src", userList[i].ProfilePictureUrl).appendTo($userListItem);

                $("<div/>").addClass("profile-status").addClass(userList[i].Status == 0 ? "offline" : "online").appendTo($userListItem);

                $("<div/>").addClass("content").text(userList[i].Name).appendTo($userListItem);

                // makes a click in the user to either create a new chat window or open an existing
                // I must clusure the 'i'
                (function (userId) {
                    // handles clicking in a user. Starts up a new chat session
                    $userListItem.click(function () {
                        _this.options.userClicked(userId);
                    });
                })(userList[i].Id);
            }
        }
    };
    return UserList;
})();

$.fn.userList = function (options) {
    if (this.length) {
        this.each(function () {
            var data = new UserList($(this), options);
            $(this).data('userList', data);
        });
    }
    return this;
};
//# sourceMappingURL=jquery.chatjs.userlist.js.map
