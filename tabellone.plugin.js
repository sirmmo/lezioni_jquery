(function($) {
    $.fn.dialogo = function(title, conf){
        var ddom = $('<div title="'+title+'"/>')
            .attr('data', conf)
            .append($('<p class="validateTips">All form fields are required.</p>'))
            .append($('<form />').append($('<fieldset />')));
        for (let s of conf){
            if(s.type !== 'hidden' && s.type !== 'select' && s.type !== 'calculated'){
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
                if(typeof s.options !== 'string' && s.options.lenght){
                    for(let op of s.options){
                        select.append($('<option />').text(op));
                    }
                } else if (typeof s.options !== 'string' && !s.options.lenght){
                    for(k in s.options){
                        og = $("<optgroup label='"+k+"'/>");
                        $.ajax({
                            url: s.options[k]+"?ipp=5000",
                            method: 'get',
                            dataType: 'json',
                            contentType: 'application/json',
                            async: false,
                        }).done(function(data){
                            for(let op of data.items){
                                og.append($('<option />')
                                    .attr('value', s.option_id(op))
                                    .text(s.option_label(op)));
                            }
                            select.append(og);
                        })
                    }
                } else {
                    $.ajax({
                        url: s.options+"?ipp=5000",
                        method: 'get',
                        dataType: 'json',
                        contentType: 'application/json',
                        async: false
                    }).done(function(data){
                        for(let op of data.items){
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
        var that = this;
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
                        var opendialog = this;
                        console.log(conf.structure);
                        var data = {};
                        for (let field of conf.structure) {
                            let input = $(this).find('[name="'+field.name+'"]');
                            if(field.prepare){
                                data[field.name] = field.prepare($(input[0]).val());
                            } else {
                                data[field.name] = $(input[0]).val();
                            }
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
                                $(opendialog).dialog("close");
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
            if(!window.navigator.onLine){
                btn.attr('disabled', true);
            }
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
        function aggiorna_lista(page = 1){
                const d_page = this.find('table');
                if(d_page)
                    page = d_page;
                table.find('tbody').empty();
                if(window.navigator.onLine){
                    $.ajax({
                        method: 'get',
                        dataType: 'json',
                        data: {page: page},
                        url: conf.endpoint,
                        success: function (data){
                            localStorage.setItem($(that).attr('id'), JSON.stringify(data));
                            console.log(data);
                            for(let libro of data.items){
                                aggiungi_item(libro, conf.structure)
                            }
                            that.find('#page_num').text(data.page);
                            that.find('#page_prev').data('page', data.page-1);
                            if(data.page-1 <= 0){
                                that.find('#page_prev').attr('disabled', true);
                            } else {
                                that.find('#page_prev').attr('disabled', false);
                            }
                            that.find('#page_next').data('page', data.page+1);
                            if(data.page+1 > data.pages){
                                that.find('#page_next').attr('disabled', true);
                            } else {
                                that.find('#page_next').attr('disabled', false);
                            }
                        },
                        error: function(data, status, error) {
                            console.log(data);
                            console.log(status, error);
                        }
                    })
                } else {
                    data = JSON.parse(localStorage.getItem($(that).attr('id')));
                    console.log(data);
                    for(let libro of data.items){
                        aggiungi_item(libro, conf.structure)
                    }
                    that.find('#page_num').text(data.page);
                    that.find('#page_prev').data('page', data.page-1);
                    if(data.page-1 <= 0){
                        that.find('#page_prev').attr('disabled', true);
                    } else {
                        that.find('#page_prev').attr('disabled', false);
                    }
                    that.find('#page_next').data('page', data.page+1);
                    if(data.page+1 > data.pages){
                        that.find('#page_next').attr('disabled', true);
                    } else {
                        that.find('#page_next').attr('disabled', false);
                    }
                }
            
        }
        
        aggiorna_lista();
        
        function aggiungi_item(data, structure) {
            var riga = $('<tr></tr>');
            let identifier = null;
            for (let s of structure){
                if (s.type !== 'hidden') {
                    if(s.type !== 'calculated') {
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
                        if(s.modify)
                            field = s.modify(data);
                        riga.append($('<td></td>').append(field));
                    }
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
        

        const pagination = $("<div />");
        pagination.append($('<button class="pager" id="page_prev"><</button>'));
        pagination.append($('<span id="page_num" />'));
        pagination.append($('<button class="pager" id="page_next">></button>'));

        nav.append($('<span class="spacer" />'));
        nav.append(pagination);

        this.find('.pager').click(function(){
            const goto = $(this).data('page');
            that.find('table').data('page', goto);
            aggiorna_lista(goto);
        })

        if(!window.navigator.onLine){
            that.find('#page_prev').attr('disabled', true);
            that.find('#page_next').attr('disabled', true);
        }
    };
} (jQuery));