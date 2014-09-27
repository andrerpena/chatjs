/// <reference path="../../Scripts/Typings/jquery/jquery.d.ts"/>
/// <reference path="jquery.chatjs.interfaces.ts"/>

var ChatWindowOptions = (function () {
    function ChatWindowOptions() {
    }
    return ChatWindowOptions;
})();

// a generic window that shows in the bottom right corner. It can have any content in it.
var ChatWindow = (function () {
    function ChatWindow(options) {
        var _this = this;
        var defaultOptions = new ChatWindowOptions();
        defaultOptions.isMaximized = true;
        defaultOptions.canClose = true;
        defaultOptions.onCreated = function () {
        };
        defaultOptions.onClose = function () {
        };
        defaultOptions.onMaximizedStateChanged = function () {
        };

        this.options = $.extend({}, defaultOptions, options);

        // window
        this.$window = $("<div/>").addClass("chat-window").appendTo($("body"));

        if (this.options.width)
            this.$window.css("width", this.options.width);

        // title
        this.$windowTitle = $("<div/>").addClass("chat-window-title").appendTo(this.$window);
        if (this.options.canClose) {
            var $closeButton = $("<div/>").addClass("close").appendTo(this.$windowTitle);
            $closeButton.click(function (e) {
                e.stopPropagation();

                // removes the window
                _this.$window.remove();

                // triggers the event
                _this.options.onClose(_this);
            });
        }
        $("<div/>").addClass("text").text(this.options.title).appendTo(this.$windowTitle);

        // content
        this.$windowContent = $("<div/>").addClass("chat-window-content").appendTo(this.$window);
        if (this.options.height)
            this.$windowContent.css("height", this.options.height);
        this.$windowInnerContent = $("<div/>").addClass("chat-window-inner-content").appendTo(this.$windowContent);

        // wire everything up
        this.$windowTitle.click(function () {
            _this.toggleMaximizedState();
        });

        this.setState(this.options.isMaximized, false);

        this.options.onCreated(this);
    }
    ChatWindow.prototype.getWidth = function () {
        return this.$window.outerWidth();
    };

    ChatWindow.prototype.setRightOffset = function (offset) {
        this.$window.css("right", offset);
    };

    ChatWindow.prototype.setTitle = function (title) {
        $("div[class=text]", this.$windowTitle).text(title);
    };

    ChatWindow.prototype.setVisible = function (visible) {
        if (visible)
            this.$window.show();
        else
            this.$window.hide();
    };

    // returns whether the window is maximized
    ChatWindow.prototype.getState = function () {
        return !this.$window.hasClass("minimized");
    };

    ChatWindow.prototype.setState = function (state, triggerMaximizedStateEvent) {
        // windows are maximized if the this.$windowContent is visible
        if (typeof triggerMaximizedStateEvent === "undefined") { triggerMaximizedStateEvent = true; }
        if (state) {
            // if it can't expand and is maximized
            this.$window.removeClass("minimized");
            this.$windowContent.show();
        } else {
            // if it can't expand and is minimized
            this.$window.addClass("minimized");
            this.$windowContent.hide();
        }

        if (triggerMaximizedStateEvent)
            this.options.onMaximizedStateChanged(this, state);
    };

    ChatWindow.prototype.toggleMaximizedState = function () {
        this.setState(this.$window.hasClass("minimized"));
    };

    ChatWindow.prototype.focus = function () {
        //todo: Implement
    };
    return ChatWindow;
})();

// The actual plugin
$.chatWindow = function (options) {
    var chatWindow = new ChatWindow(options);
    return chatWindow;
};
//# sourceMappingURL=jquery.chatjs.window.js.map
