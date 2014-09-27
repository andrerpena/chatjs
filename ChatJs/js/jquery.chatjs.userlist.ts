/// <reference path="../../Scripts/Typings/jquery/jquery.d.ts"/>
/// <reference path="jquery.chatjs.interfaces.ts"/>
/// <reference path="jquery.chatjs.utils.ts"/>
/// <reference path="jquery.chatjs.adapter.ts"/>
/// <reference path="jquery.chatjs.window.ts"/>
/// <reference path="jquery.chatjs.messageboard.ts"/>

interface JQuery {
    userList: (options: UserListOptions) => JQuery;
}

class UserListOptions {
    adapter: IAdapter;
    conversationId: number;
    roomId: number;
    // the id of the current user
    userId: number;
    emptyRoomText: string;
    height: number;
    userClicked: (userId: number) => void;
    // whether or not the current user should be excluded from the user list
    excludeCurrentUser: boolean;
}

class UserList {
    constructor(jQuery: JQuery, options: UserListOptions) {
        this.$el = jQuery;

        var defaultOptions = new UserListOptions();
        defaultOptions.emptyRoomText = "No users available for chatting.";
        defaultOptions.height = 100;
        defaultOptions.excludeCurrentUser = false;
        defaultOptions.userClicked = () => {};

        this.options = $.extend({}, defaultOptions, options);

        this.$el.addClass("user-list");

        ChatJsUtils.setOuterHeight(this.$el, this.options.height);

        // when the user list changed, this list must be updated
        this.options.adapter.client.onUserListChanged((userListData: ChatUserListChangedInfo) => {
            if ((this.options.roomId && userListData.RoomId == this.options.roomId) || (this.options.conversationId && this.options.conversationId == userListData.ConversationId)) {
                var userList = userListData.UserList;
                this.populateList(userList);
            }
        });

        // loads the list now
        this.options.adapter.server.getUserList(this.options.roomId, this.options.conversationId, userList => {
            this.populateList(userList);
        });
    }


    populateList(rawUserList) {

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

                var $userListItem = $("<div/>")
                    .addClass("user-list-item")
                    .attr("data-val-id", userList[i].Id)
                    .appendTo(this.$el);

                $("<img/>")
                    .addClass("profile-picture")
                    .attr("src", userList[i].ProfilePictureUrl)
                    .appendTo($userListItem);

                $("<div/>")
                    .addClass("profile-status")
                    .addClass(userList[i].Status == 0 ? "offline" : "online")
                    .appendTo($userListItem);

                $("<div/>")
                    .addClass("content")
                    .text(userList[i].Name)
                    .appendTo($userListItem);

                // makes a click in the user to either create a new chat window or open an existing
                // I must clusure the 'i'
                (userId => {
                    // handles clicking in a user. Starts up a new chat session
                    $userListItem.click(() => {
                        this.options.userClicked(userId);
                    });
                })(userList[i].Id);
            }
        }
    }

    $el: JQuery;
    options: UserListOptions;
}


$.fn.userList = function(options: UserListOptions) {
    if (this.length) {
        this.each(function() {
            var data = new UserList($(this), options);
            $(this).data('userList', data);
        });
    }
    return this;
};