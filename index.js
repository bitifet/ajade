// lib/misc/ajade.js
// =================
"use strict";
define([
    './bower_components/jade/jade',
], function(
    Jade
) {

    function parseSrc(src) {//{{{
        var subtag = src.match(/^.+$/m)[0];
        src = src.substring(subtag.length+1);

        var blocks = [];

        var indent;
        var pos = 0;
        var capture;
        while (
            null !== (capture = src.substring(pos).match(/^(\s+)(before|then|catch)\s*$/mi))
        ) {
            pos = pos+capture.index+capture[0].length + 1;
            if (indent && indent != capture[1]) continue;
            indent = capture[1];
            if (blocks.length) {
                blocks[blocks.length-1].end = capture ? pos - capture[0].length - 1: undefined;
            };
            blocks.push({
                when: capture[2].toLowerCase(),
                start: pos,
            });
        };

        var parts = {
            subtag: subtag,
            tpl: {},
        };

        for (var i=0; i<blocks.length; i++) {
            parts.tpl[blocks[i].when] = "block "+"aJade_block_"+Math.random()+"\n"
                + src.substring(blocks[i].start, blocks[i].end)+"\n"
            ; // NOTE: Random block name avoids Jade unexpected indentation error.
        };

        parts.tpl.before || (parts.tpl.before = "  p Loading...");
        parts.tpl.then || (parts.tpl.then = "  h2 WARNING: then-template not yet defined!!");
        parts.tpl.catch || (parts.tpl.catch = "  h2 Loading Error");

        return parts;
    };//}}}

    Jade.aRender = function (
        target,
        tpl,
        model
    ) {
        if (typeof tpl != "function") tpl = tpl(model); // Accept not yet compiled templates.
        target.html(tpl(model)); // Render master template.


        $("script[type=ajade]", target).each(function(){
            var container = $(this);

            var url = container.data("src");

            // Models:
            var defaultModel = container.data("model") || {};
            var models = container.data("models") || {};
            if (! models.before) models.before = defaultModel;
            if (! models.then) models.then = defaultModel;
            if (! models.catch) models.catch = defaultModel;

            var src = parseSrc(container.html());

            var subTarget = $(Jade.render(src.subtag));

            // "Before" state://{{{
            subTarget.html(Jade.render(src.tpl.before, { // Direct render.
                model: models.before,
                data: {},
            }));//}}}

            // Oringinal container replacement:
            container.replaceWith(subTarget);
            
            // Send async data request.//{{{
            var p = new Promise(function(resolve, reject){
                $.ajax({
                    url: url,
                    success: resolve,
                    error: reject,
                });
            });//}}}

            // thenTpl precompilation:
            var thenRenderer = Jade.compile(src.tpl.then);

            // "Then" state://{{{
            p.then(function(data){
                Jade.aRender(subTarget
                    , thenRenderer
                    , {
                        model: models.then,
                        data: data,
                    }
                );
            });//}}}

            // "Catch" state://{{{
            p.catch(function(err){
                subTarget.html(
                    Jade.render(src.tpl.catch, {
                        err: err,
                        model: models.catch,
                    })
                );
            });//}}}


            //*/



        });

    };

    return Jade;
});
