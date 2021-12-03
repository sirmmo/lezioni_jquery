(function($) {
    $.fn.dialogo = function(title, conf){
        var ddom = $('<div title="'+title+'"/>')
            .attr('data', conf)
            .append($('<p class="validateTips">All form fields are required.</p>'))
            .append($('<form />').append($('<fieldset />')));
        for (let s of conf){
            if(s.type !== 'hidden' && s.type !== 'select'){
                ddom.find('fieldset')
                    .append($('<label />')
                        .attr('for', s.name)
                        .text(s.title))
                    .append($('<input />')
                        .attr('type', s.type)
                        .attr('name', s.name)
                        .addClass('ui-widget-content')
                        .addClass('ui-corner-all'))
                    .append($('<br />'))
            }

            if(s.type === 'select'){
                const select = $('<select />')
                    .attr('name', s.name)
                if(typeof s.options !== 'string'){
                    for(let op of s.options){
                        select.append($('<option />').text(op));
                    }
                } else {
                    $.ajax({
                        url: s.options,
                        method: 'get',
                        dataType: 'json',
                        contentType: 'application/json',
                        async: false
                    }).done(function(data){
                        for(let op of data){
                            select.append($('<option />')
                                .attr('value', s.option_id(op))
                                .text(s.option_label(op)));
                        }
                    })
                }
                ddom.find('fieldset')
                    .append($('<label />')
                        .attr('for', s.name)
                        .text(s.title))
                    .append(select)
                    .append($('<br />'))
            }
        }
        this.append(ddom);
        return ddom;
    }
    $.fn.tabellone = function(conf) {
        var nav = $('<nav />');
        if(!conf.hasDialog == false){
            var ddom = this.dialogo('Aggiungi ' + conf.item_name, conf.structure);
            dialog = ddom.dialog({
                autoOpen: false,
                height: 400,
                width: 350,
                modal: true,
                buttons: {
                    "Aggiungi": function () {
                        console.log(conf.structure);
                        var data = {};
                        for (let field of conf.structure) {
                            let input = $(this).find('[name="'+field.name+'"]');
                            data[field.name] = $(input[0]).val();
                        }
                        if(conf.endpoint){
                            $.ajax({
                                method: 'POST',
                                dataType: 'json',
                                contentType: 'application/json',
                                url: conf.endpoint,
                                data: JSON.stringify(data)
                            }).done(function(){
                                aggiorna_lista();
                                $(this).dialog("close");
                            });
                        } else {
                            aggiungi_item(data, conf.structure);
                            $(this).dialog("close");
                        }
                    },
                    Annulla: function () {
                        $(this).dialog("close");
                    }
                },
                close: function () {
                    $(dialog).find('form')[0].reset();
                    //allFields.removeClass("ui-state-error");
                }
            })
            var btn = $('<button />')
                .addClass('add_button')
                .data('dialog', dialog)
                .attr('id', 'add_'+conf.item_name.replace(' ', '_'))
                .click(function () {
                    $(this).data('dialog').dialog("open");
                })
            btn.append($('<i class="fas fa-fw fa-plus"></i>'));
            btn.append($('<span/>').text(conf.item_name));
            nav.append(btn);
        }
        if(conf.buttons){
            for(const button of conf.buttons){
                const dbtn = $('<button />')
                    .addClass('add_button')
                    .text(button.label)
                    .click(button.action)
                nav.append(dbtn);
            }
        }
        this.append(nav);

        var table = $('<table class="ui-widget ui-widget-content" />');
        var thead = $('<thead />').append('<tr />');
        for (let s of conf.structure){
            if(s.type !== 'hidden')
                thead.find('tr').append($('<th />').text(s.title));
        }
        thead.find('tr').append($('<th />').text("Azioni"));
        table.append(thead);
        table.append($('<tbody />'));
        this.append(table);
        function aggiorna_lista(){
                table.find('tbody').empty();
                $.ajax({
                    method: 'get',
                    dataType: 'json',
                    url: conf.endpoint,
                    success: function (data){
                        console.log(data);
                        for(let libro of data){
                            aggiungi_item(libro, conf.structure)
                        }
                    },
                    error: function(data, status, error) {
                        console.log(data);
                        console.log(status, error);
                    }
                })
            
        }
        
        aggiorna_lista();
        
        function aggiungi_item(data, structure) {
            var riga = $('<tr></tr>');
            let identifier = null;
            for (let s of structure){
                if (s.type !== 'hidden') {
                    let text = "";
                    if(typeof s.name === 'string'){
                        text = data[s.name];
                    } else {
                        text = s.name(data);
                    }

                    if(s.modify)
                        text = s.modify(text);
                    riga.append($('<td></td>').text(text));
                } else { 
                    identifier = s.name;
                }
            }
            riga.append($('<td></td>').append(
                $('<button class="ui-button">Cancella</button>').click(function(){
                    $.ajax({
                        method: 'DELETE',
                        dataType: 'json',
                        contentType: 'application/json',
                        url: conf.endpoint+'/'+ data[identifier]
                    }).done(function(){
                        aggiorna_lista();
                    })
                })
            ));
            table.find('tbody').append(riga);

        }
    };
} (jQuery));