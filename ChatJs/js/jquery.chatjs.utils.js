/// <reference path="../../Scripts/Typings/jquery/jquery.d.ts"/>
var ChatJsUtils = (function () {
    function ChatJsUtils() {
    }
    ChatJsUtils.setOuterHeight = function (jQuery, height) {
        var heights = new Array();
        heights.push(parseInt(jQuery.css("padding-top").replace("px", "")));
        heights.push(parseInt(jQuery.css("padding-bottom").replace("px", "")));
        heights.push(parseInt(jQuery.css("border-top-width").replace("px", "")));
        heights.push(parseInt(jQuery.css("border-bottom-width").replace("px", "")));
        heights.push(parseInt(jQuery.css("margin-top").replace("px", "")));
        heights.push(parseInt(jQuery.css("margin-bottom").replace("px", "")));
        var calculatedHeight = height;
        for (var i = 0; i < heights.length; i++)
            calculatedHeight -= heights[i];
        jQuery.height(calculatedHeight);
    };

    ChatJsUtils.setOuterWidth = function (jQuery, width) {
        var widths = new Array();
        widths.push(parseInt(jQuery.css("padding-left").replace("px", "")));
        widths.push(parseInt(jQuery.css("padding-right").replace("px", "")));
        widths.push(parseInt(jQuery.css("border-top-left").replace("px", "")));
        widths.push(parseInt(jQuery.css("border-bottom-right").replace("px", "")));
        widths.push(parseInt(jQuery.css("margin-left").replace("px", "")));
        widths.push(parseInt(jQuery.css("margin-right").replace("px", "")));
        var calculatedWidth = width;
        for (var i = 0; i < widths.length; i++)
            calculatedWidth -= widths[i];
        jQuery.width(calculatedWidth);
    };
    return ChatJsUtils;
})();
//# sourceMappingURL=jquery.chatjs.utils.js.map
