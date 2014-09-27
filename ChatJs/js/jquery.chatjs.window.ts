/// <reference path="../../Scripts/Typings/jquery/jquery.d.ts"/>
/// <reference path="jquery.chatjs.interfaces.ts"/>

interface JQueryStatic {
    chatWindow(options:ChatWindowOptions): ChatWindow;
}

class ChatWindowOptions {
    width:number;
    height:number;
    canClose:boolean;
    title:string;
    isMaximized:boolean;
    // event triggered when the window is created.
    // in order to add content to the newly created window, use chatWindow.$windowInnerContent
    onCreated:(chatWindow:ChatWindow) => void;
    onClose:(chatWindow:ChatWindow) => void;
    // called when the user minimizes or maximizes the window
    onMaximizedStateChanged:(chatWindow:ChatWindow, isMaximized:boolean) => void;
}

// a generic window that shows in the bottom right corner. It can have any content in it.
class ChatWindow implements IWindow<boolean> {
    constructor(options:ChatWindowOptions) {

        var defaultOptions = new ChatWindowOptions();
        defaultOptions.isMaximized = true;
        defaultOptions.canClose = true;
        defaultOptions.onCreated = () => {
        };
        defaultOptions.onClose = () => {
        };
        defaultOptions.onMaximizedStateChanged = () => {
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
            $closeButton.click(e => {
                e.stopPropagation();
                // removes the window
                this.$window.remove();
                // triggers the event
                this.options.onClose(this);
            });
        }
        $("<div/>").addClass("text").text(this.options.title).appendTo(this.$windowTitle);

        // content
        this.$windowContent = $("<div/>").addClass("chat-window-content").appendTo(this.$window);
        if (this.options.height)
            this.$windowContent.css("height", this.options.height);
        this.$windowInnerContent = $("<div/>").addClass("chat-window-inner-content").appendTo(this.$windowContent);

        // wire everything up
        this.$windowTitle.click(() => {
            this.toggleMaximizedState();
        });

        this.setState(this.options.isMaximized, false);

        this.options.onCreated(this);
    }

    getWidth() {
        return this.$window.outerWidth();
    }

    setRightOffset(offset:number) {
        this.$window.css("right", offset);
    }

    setTitle(title:string) {
        $("div[class=text]", this.$windowTitle).text(title);
    }

    setVisible(visible:boolean) {
        if (visible)
            this.$window.show();
        else
            this.$window.hide();
    }

    // returns whether the window is maximized
    getState():boolean {
        return !this.$window.hasClass("minimized");
    }

    setState(state:boolean, triggerMaximizedStateEvent = true):void {
        // windows are maximized if the this.$windowContent is visible

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
    }

    toggleMaximizedState():void {
        this.setState(this.$window.hasClass("minimized"));
    }

    focus():void {
        //todo: Implement
    }

    defaults:ChatWindowOptions;
    options:ChatWindowOptions;
    $window:JQuery;
    $windowTitle:JQuery;
    $windowContent:JQuery;
    $windowInnerContent:JQuery;
}

// The actual plugin
$.chatWindow = (options:ChatWindowOptions) => {
    var chatWindow = new ChatWindow(options);
    return chatWindow;
};