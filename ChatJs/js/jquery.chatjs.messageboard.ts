/// <reference path="../../Scripts/Typings/jquery/jquery.d.ts"/>
/// <reference path="../../Scripts/Typings/autosize/autosize.d.ts"/>
/// <reference path="jquery.chatjs.utils.ts"/>
/// <reference path="jquery.chatjs.adapter.ts"/>

interface JQuery {
    messageBoard: (options: MessageBoardOptions) => JQuery;
}

class MessageBoardOptions {
    adapter: IAdapter;

    // current user id
    userId: number;
    // in case this is a PM board, this is the other user id
    otherUserId: number;
    // in case this is a room board, this is the room id
    roomId: number;
    // in case this is a conversation board, this is the conversation id
    conversationId: number;
    // text displayed while the other user is typing
    typingText: string;
    // whether to play sound when message arrives
    playSound: boolean;
    // path to the chatjs folder
    chatJsContentPath: string
    height: number;
    newMessage: (message: ChatMessageInfo) => void;
}

class MessageBoard {
    constructor(jQuery: JQuery, options: MessageBoardOptions) {
        this.$el = jQuery;

        var defaultOptions = new MessageBoardOptions();
        defaultOptions.typingText = " is typing...";
        defaultOptions.playSound = true;
        defaultOptions.height = 100;
        defaultOptions.chatJsContentPath = "/chatjs/";
        defaultOptions.newMessage = (message: ChatMessageInfo) => {};

        this.options = $.extend({}, defaultOptions, options);

        this.$el.addClass("message-board");

        ChatJsUtils.setOuterHeight(this.$el, this.options.height);

        this.$messagesWrapper = $("<div/>").addClass("messages-wrapper").appendTo(this.$el);

        // sets up the text
        var $windowTextBoxWrapper = $("<div/>").addClass("chat-window-text-box-wrapper").appendTo(this.$el);

        this.$textBox = $("<textarea />").attr("rows", "1").addClass("chat-window-text-box").appendTo($windowTextBoxWrapper);

        this.$textBox.autosize({
            callback: ta => {
                var messagesHeight = this.options.height - $(ta).outerHeight();
                ChatJsUtils.setOuterHeight(this.$messagesWrapper, messagesHeight);
            }
        });

        this.$textBox.val(this.$textBox.val());

        this.options.adapter.client.onTypingSignalReceived((typingSignal: ChatTypingSignalInfo) => {

            var shouldProcessTypingSignal = false;

            if (this.options.otherUserId) {
                // it's a PM message board.
                shouldProcessTypingSignal = typingSignal.UserToId == this.options.userId && typingSignal.UserFrom.Id == this.options.otherUserId;
            } else if (this.options.roomId) {
                // it's a room message board
                shouldProcessTypingSignal = typingSignal.RoomId == this.options.roomId && typingSignal.UserFrom.Id != this.options.userId;
            } else if (this.options.conversationId) {
                // it's a conversation message board
                shouldProcessTypingSignal = typingSignal.ConversationId == this.options.conversationId && typingSignal.UserFrom.Id != this.options.userId;
            }
            if (shouldProcessTypingSignal)
                this.showTypingSignal(typingSignal.UserFrom);

        });

        this.options.adapter.client.onMessagesChanged((message: ChatMessageInfo) => {

            var shouldProcessMessage = false;

            if (this.options.otherUserId) {
                // it's a PM message board.
                shouldProcessMessage = (message.UserFromId == this.options.userId && message.UserToId == this.options.otherUserId) || (message.UserFromId == this.options.otherUserId && message.UserToId == this.options.userId);
            } else if (this.options.roomId) {
                // it's a room message board
                shouldProcessMessage = message.RoomId == this.options.roomId;
            } else if (this.options.conversationId) {
                // it's a conversation message board
                shouldProcessMessage = message.ConversationId == this.options.conversationId;
            }

            if (shouldProcessMessage) {
                this.addMessage(message);
                if (message.UserFromId != this.options.userId) {
                    if (this.options.playSound)
                        this.playSound();
                }
                this.options.newMessage(message);
            }
        });

        // gets the message history
        this.options.adapter.server.getMessageHistory(this.options.roomId, this.options.conversationId, this.options.otherUserId, messages => {

            for (var i = 0; i < messages.length; i++) {
                this.addMessage(messages[i], false);
            }

            this.adjustScroll();

            this.$textBox.keypress((e) => {
                // if a send typing signal is in course, remove it and create another
                if (this.sendTypingSignalTimeout == undefined) {
                    this.sendTypingSignalTimeout = setTimeout(() => {
                        this.sendTypingSignalTimeout = undefined;
                    }, 3000);
                    this.sendTypingSignal();
                }

                if (e.which == 13) {
                    e.preventDefault();
                    if (this.$textBox.val()) {
                        this.sendMessage(this.$textBox.val());
                        this.$textBox.val('').trigger("autosize.resize");
                    }
                }
            });
        });
    }

    showTypingSignal(user: ChatUserInfo) {
        /// <summary>Adds a typing signal to this window. It means the other user is typing</summary>
        /// <param FullName="user" type="Object">the other user info</param>
        if (this.$typingSignal)
            this.$typingSignal.remove();
        this.$typingSignal = $("<p/>").addClass("typing-signal").text(user.Name + this.options.typingText);
        this.$messagesWrapper.append(this.$typingSignal);
        if (this.typingSignalTimeout)
            clearTimeout(this.typingSignalTimeout);
        this.typingSignalTimeout = setTimeout(() => {
            this.removeTypingSignal();
        }, 5000);

        this.adjustScroll();
    }

    removeTypingSignal() {
        /// <summary>Remove the typing signal, if it exists</summary>
        if (this.$typingSignal)
            this.$typingSignal.remove();
        if (this.typingSignalTimeout)
            clearTimeout(this.typingSignalTimeout);
    }

    adjustScroll() {
        this.$messagesWrapper[0].scrollTop = this.$messagesWrapper[0].scrollHeight;
    }

    sendTypingSignal() {
        /// <summary>Sends a typing signal to the other user</summary>
        this.options.adapter.server.sendTypingSignal(this.options.roomId, this.options.conversationId, this.options.otherUserId, () => {});
    }

    sendMessage(messageText) {
        /// <summary>Sends a message to the other user</summary>
        /// <param FullName="messageText" type="String">Message being sent</param>
        var generateGuidPart = () => (((1 + Math.random()) * 0x10000) | 0).toString(16).substring(1);

        var clientGuid = (generateGuidPart() + generateGuidPart() + '-' + generateGuidPart() + '-' + generateGuidPart() + '-' + generateGuidPart() + '-' + generateGuidPart() + generateGuidPart() + generateGuidPart());

        var message = new ChatMessageInfo();
        message.UserFromId = this.options.userId;
        message.Message = messageText;
        message.ClientGuid = clientGuid;

        this.addMessage(message);

        this.options.adapter.server.sendMessage(this.options.roomId, this.options.conversationId, this.options.otherUserId, messageText, clientGuid, () => {});
    }

    playSound() {
        /// <summary>Plays a notification sound</summary>
        /// <param FullName="fileFullName" type="String">The file path without extension</param>
        var $soundContainer = $("#soundContainer");
        if (!$soundContainer.length)
            $soundContainer = $("<div>").attr("id", "soundContainer").appendTo($("body"));
        var baseFileName = this.options.chatJsContentPath + "sounds/chat";
        var oggFileName = baseFileName + ".ogg";
        var mp3FileName = baseFileName + ".mp3";

        var $audioTag = $("<audio/>").attr("autoplay", "autoplay");
        $("<source/>").attr("src", oggFileName).attr("type", "audio/mpeg").appendTo($audioTag);
        $("<embed/>").attr("src", mp3FileName).attr("autostart", "true").attr("loop", "false").appendTo($audioTag);

        $audioTag.appendTo($soundContainer);
    }

    focus() {
        this.$textBox.focus();
    }

    addMessage(message: ChatMessageInfo, scroll?: boolean) {
        /// <summary>
        ///     Adds a message to the board. This method is called both when the current user or the other user is sending a
        ///     message
        /// </summary>
        /// <param name="message" type="Object">Message</param>
        /// <param name="clientGuid" type="String">Message client guid</param>
        if (scroll == undefined)
            scroll = true;

        if (message.UserFromId != this.options.userId) {
            // the message did not came from myself. Better erase the typing signal
            this.removeTypingSignal();
        }

        // takes a jQuery element and replace it's content that seems like an URL with an
        // actual link or e-mail
        function linkify($element) {
            var inputText = $element.html();
            var replacedText, replacePattern1, replacePattern2, replacePattern3;

            //URLs starting with http://, https://, or ftp://
            replacePattern1 = /(\b(https?|ftp):\/\/[-A-Z0-9+&@#\/%?=~_|!:,.;]*[-A-Z0-9+&@#\/%=~_|])/gim;
            replacedText = inputText.replace(replacePattern1, '<a href="$1" target="_blank">$1</a>');

            //URLs starting with "www." (without // before it, or it'd re-link the ones done above).
            replacePattern2 = /(^|[^\/])(www\.[\S]+(\b|$))/gim;
            replacedText = replacedText.replace(replacePattern2, '$1<a href="http://$2" target="_blank">$2</a>');

            //Change email addresses to mailto:: links.
            replacePattern3 = /(\w+@[a-zA-Z_]+?\.[a-zA-Z]{2,6})/gim;
            replacedText = replacedText.replace(replacePattern3, '<a href="mailto:$1">$1</a>');

            return $element.html(replacedText);
        }

        function emotify($element) {
            var inputText = $element.html();
            var replacedText = inputText;

            var emoticons = [
                { pattern: ":-\)", cssClass: "happy" },
                { pattern: ":\)", cssClass: "happy" },
                { pattern: "=\)", cssClass: "happy" },
                { pattern: ":-D", cssClass: "very-happy" },
                { pattern: ":D", cssClass: "very-happy" },
                { pattern: "=D", cssClass: "very-happy" },
                { pattern: ":-\(", cssClass: "sad" },
                { pattern: ":\(", cssClass: "sad" },
                { pattern: "=\(", cssClass: "sad" },
                { pattern: ":-\|", cssClass: "wary" },
                { pattern: ":\|", cssClass: "wary" },
                { pattern: "=\|", cssClass: "wary" },
                { pattern: ":-O", cssClass: "astonished" },
                { pattern: ":O", cssClass: "astonished" },
                { pattern: "=O", cssClass: "astonished" },
                { pattern: ":-P", cssClass: "tongue" },
                { pattern: ":P", cssClass: "tongue" },
                { pattern: "=P", cssClass: "tongue" }
            ];

            for (var i = 0; i < emoticons.length; i++) {
                replacedText = replacedText.replace(emoticons[i].pattern, "<span class='" + emoticons[i].cssClass + "'></span>");
            }

            return $element.html(replacedText);
        }

        if (message.ClientGuid && $("p[data-val-client-guid='" + message.ClientGuid + "']").length) {
            // in this case, this message is comming from the server AND the current user POSTED the message.
            // so he/she already has this message in the list. We DO NOT need to add the message.
            $("p[data-val-client-guid='" + message.ClientGuid + "']").removeClass("temp-message").removeAttr("data-val-client-guid");
        } else {
            var $messageP = $("<p/>").text(message.Message);
            if (message.ClientGuid)
                $messageP.attr("data-val-client-guid", message.ClientGuid).addClass("temp-message");

            linkify($messageP);
            emotify($messageP);

            // gets the last message to see if it's possible to just append the text
            var $lastMessage = $("div.chat-message:last", this.$messagesWrapper);
            if ($lastMessage.length && $lastMessage.attr("data-val-user-from") == message.UserFromId.toString()) {
                // we can just append text then
                $messageP.appendTo($(".chat-text-wrapper", $lastMessage));
            } else {
                // in this case we need to create a whole new message
                var $chatMessage = $("<div/>").addClass("chat-message").attr("data-val-user-from", message.UserFromId);
                $chatMessage.appendTo(this.$messagesWrapper);

                var $gravatarWrapper = $("<div/>").addClass("chat-gravatar-wrapper").appendTo($chatMessage);
                var $textWrapper = $("<div/>").addClass("chat-text-wrapper").appendTo($chatMessage);

                // add text
                $messageP.appendTo($textWrapper);

                // add image
                var $img = $("<img/>").addClass("profile-picture").appendTo($gravatarWrapper);
                this.options.adapter.server.getUserInfo(message.UserFromId, user => {
                    $img.attr("src", decodeURI(user.ProfilePictureUrl));
                });
            }
        }

        if (scroll)
            this.adjustScroll();
    }

    $el: JQuery;
    options: MessageBoardOptions;
    $messagesWrapper: JQuery;
    $textBox: JQuery;
    $typingSignal: JQuery;
    typingSignalTimeout: number;
    sendTypingSignalTimeout: number;
}

$.fn.messageBoard = function(options: MessageBoardOptions) {
    if (this.length) {
        this.each(function() {
            var data = new MessageBoard($(this), options);
            $(this).data('messageBoard', data);
        });
    }
    return this;
};