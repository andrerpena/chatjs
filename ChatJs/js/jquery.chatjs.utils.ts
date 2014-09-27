/// <reference path="../../Scripts/Typings/jquery/jquery.d.ts"/>

class ChatJsUtils {

    static setOuterHeight(jQuery: JQuery, height: number): void {
        var heights = new Array<number>();
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
    }

    static setOuterWidth(jQuery: JQuery, width: number): void {
        var widths = new Array<number>();
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
    }

}