// ajade.js
// ========
"use strict";
define([
    '../jade/jade',
], function(
    Jade
) {

    var readyTriggerName = "aJadeReady";

    var readyTrigger = (function(){
        var trigTpl = Jade.compile([
            "",
            "script(id=templateId).",
            "  $(document.currentScript).trigger('"+readyTriggerName+"', '#{templateId}');",
        ].join("\n"));
        return function renderTrigger(tplId) {
            return trigTpl({templateId: tplId});
        };
    })();

    function randomId() {
        return Math.random().toString(36).replace(/[^a-z]+/g, '').substr(2);
    };


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
        if (typeof tpl != "function") tpl = Jade.compile(tpl); // Accept not yet compiled templates.

        var tplId = randomId();


        return new Promise(function(resolveRender, reject) {

            target.html( // Render master template.
                tpl(model)
                + readyTrigger(tplId)
            ).ready(function() {

                var tokens = [];

                $("script[type=ajade]", target).each(function(){ // Pick for subtemplates//{{{
                    var container = $(this);

                    var url = container.data("src");
                    var externalTemplate = container.data("then"); // Override internal if specified.

                    // Models:
                    var defaultModel = container.data("model") || {};
                    var models = container.data("models") || {};
                    if (! models.before) models.before = defaultModel;
                    if (! models.then) models.then = defaultModel;
                    if (! models.catch) models.catch = defaultModel;

                    var src = parseSrc(container.html());

                    var onRenderer = (//{{{
                        externalTemplate
                        ? new Promise (function(resolve, reject) {
                            $.ajax({
                                url: externalTemplate,
                                success: resolve,
                                error: reject,
                            });
                        })
                        : Promise.resolve(src.tpl.then) // Use internal if not data-then not specified.
                    ).then(Jade.compile)
                    ;//}}}

                    var subTarget = $(Jade.render(src.subtag));

                    // "Before" state://{{{
                    subTarget.html(Jade.render(src.tpl.before, { // Direct render.
                        model: models.before,
                        data: {},
                    }));//}}}

                    // Oringinal container replacement:
                    container.replaceWith(subTarget);

                    // Send async data request.//{{{
                    var onModel = new Promise(function(resolve, reject){
                        if (! url) {
                            resolve({});
                        } else {
                            $.ajax({
                                url: url,
                                success: resolve,
                                error: reject,
                            });
                        };
                    });//}}}

                    var renderProcess = Promise.all([
                        onRenderer
                        , onModel
                    ])
                    .then(function(elements){ // "Then" state://{{{
                        var theRenderer = elements[0];
                        var data = elements[1];
                        if (typeof data == "string") { // HTML data
                            return new Promise(function (resolve, reject) {
                                subTarget.html(data)
                                    .ready(resolve)
                                ;
                            });
                        } else { // JSON data.
                            return Jade.aRender(subTarget
                                , theRenderer
                                , $.extend(
                                    {}
                                    , model
                                    , models.then
                                    , {
                                        model: models.then,
                                        data: data,
                                    }
                                )
                            );
                        };
                    })//}}}
                    .catch(function(err){ // "Catch" state://{{{
                        subTarget.html(
                            Jade.render(src.tpl.catch, {
                                err: err,
                                model: models.catch,
                            })
                        );
                    });//}}}

                    tokens.push(
                        renderProcess.catch(x=>Promise.resolve())
                    );

                });//}}}

                // Return promise that resolves when all render processes are fullfilled.
                resolveRender (Promise.all(tokens).then(foo=>alert("Prematurely resolving "+tplId)));

            });

            var itv = setInterval(function(){
                if ($("script#"+tplId, target).length >= 1) {
                    clearInterval(itv);
                    alert ("Rendered " + tplId);
                };
            }, 10);


            // target.on(readyTriggerName, function (ev, tid) {
            //     alert ("Rendered " + tid);
            // });
        });

    };

    return Jade;
});
