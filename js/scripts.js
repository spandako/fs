$(function() {
	var addFont = $('[data-action=add-font]');
	var fontList = $('#font-list');
	var definitions = $('#definitions');
	var generated = $('#generated-document');
	var showWebsafeFontsTrigger = $('[data-action=show-websafe-fonts]');
	var websafeFontsList = $('#websafe-fonts');
	var showWebFontsTrigger = $('[data-action=show-webfonts-input]');
	var hideWebFontsTrigger = $('[data-action=hide-webfonts-input]');
	var helpTrigger = $('[data-action=help-trigger]');
	var helpBox = $('.help');
	var specification = {};

	websafeFontsList.find('div').each(function() {
		$(this).css('font-family',$(this).html());
	});

	addFont.click(function(e) {
		if(!(fontList.find('[data-name=#new]').length)) {
			fontList.append('<span class="font" data-name="#new"></span>');
		}
		definitions.attr('data-font','#new');
		definitions.find('input').val('');

		$('input[name=name]').focus();

		e.preventDefault();
	});

	fontList.on('click','.font',function() {
		var selectedFont = $(this).attr('data-name');
		
		definitions.attr('data-font', selectedFont);
		definitions.find('.field input').each(function() {
			var field = $(this);
			field.val(specification[selectedFont][field.attr('name')]);
		});
		
	});

	definitions.find('[name=name]').change(function() {

		var currentFont = definitions.attr('data-font');
		var slugname = convertToSlug($(this).val());

		fontList.find('[data-name='+currentFont+']').html(slugname);
		$(this).val(slugname);

		if(definitions.attr("data-font") == "#new") {
			var newKey = Object.keys(specification).length;

			fontList.find('[data-name=#new]').attr('data-name', newKey);
			definitions.attr('data-font', newKey);
			// add specification
			var newFont = {
					name: slugname,
					fontFamily: 'Arial, Helvetica, sans-serif',
					fontSize: "14px",
					fontWeight: "normal",
					fontStyle: "normal",
					lineHeight: "1.2",
					color: "#4d4d4d"
				};
			
			specification[newKey] = newFont;
			

			if($('[name=url]') != '' && $('[name=url]') != undefined) {
				specification[newKey]['url'] = $('[name=url]').val();
			}

			$.each(specification[newKey], function(key,value) {
				fontList.find('[data-name='+newKey+']').css(key, value);
			});


			
		} else {
			specification[currentFont]['name'] = slugname;
		}

	});

	definitions.find('[name=url]').change(function() {
		var currentFont = definitions.attr('data-font');
		if(currentFont != '#new') {
			specification[currentFont]['url'] = $(this).val();
		}

		$('head').prepend($(this).val());

		showWebFontsTrigger.show();
		$('.webfonts-url').addClass('hidden');
	});

	definitions.find('[name=fontFamily]').change(function() {
		var changedFontFamily = $(this).val();
		var skipUpdateList = false;
		
		websafeFontsList.find('div').each(function() {
			if($(this).text() == changedFontFamily) {
				skipUpdateList = true;
			}
		});

		if(!skipUpdateList) {
			websafeFontsList.append('<div class="webfont-option" style="font-family:'+changedFontFamily+';">'+ changedFontFamily +'</div>');
		}
	});

	definitions.find('input').keyup(function() {
		var currentFont = definitions.attr('data-font');
		var attribute = $(this).attr('name');
		var value = $.trim($(this).val());

		if($(this).attr('name') == 'name' && definitions.attr("data-font") != "#new") {
			specification[currentFont][attribute] = value;
			fontList.find('[data-name='+currentFont+']').css(attribute, value);

			var craft = JSON.stringify(specification);
			
			generated.val(craft);
			
		} else if(definitions.attr("data-font") != "#new" && $(this).attr('name') != 'name' && $(this).attr('name') != 'url') {
			// update specification

			if(value == "" || value == undefined) {
				value = $(this).attr('placeholder');
			}

			specification[currentFont][attribute] = value;
			fontList.find('[data-name='+currentFont+']').css(attribute, value);

			var craft = JSON.stringify(specification);
			
			generated.val(craft);
			
		}
		
	});

	generated.focus(function() {
	    var $this = $(this);
	    $this.select();

	    // Work around Chrome's little problem
	    $this.mouseup(function() {
	        // Prevent further mouseup intervention
	        $this.unbind("mouseup");
	        return false;
	    });
	});

	generated.change(function() {
		var encodedCraft = $(this).val();
		specification = $.parseJSON(encodedCraft);

		fontList.html('');

		$.each(specification, function(id, properties) {
			fontList.append('<span class="font" data-name="'+ id +'">'+ specification[id]['name'] +'</span>');
			
			$.each(specification[id], function(property, value) {
				if(property == 'fontFamily' && value != '') {
					var skipUpdateList = false;
					
					websafeFontsList.find('div').each(function() {
						if($(this).text() == value) {
							skipUpdateList = true;
						}
					});

					if(!skipUpdateList) {
						websafeFontsList.append('<div class="webfont-option" style="font-family:'+value+';">'+ value +'</div>');
					}
				}

				if(property == 'url' && value != '') {
					$('head').prepend(value);
				} else {
					fontList.find('[data-name='+id+']').css(property, value);
				}
				
			});
		});
		fontList.append('<span class="font" data-name="#new"></span>');

	});

	showWebsafeFontsTrigger.click(function(e) {
		toggleWebsafeFontsList();
		e.stopPropagation();
	});

	websafeFontsList.find('div').click(function(e) {
		$('input[name=fontFamily]').val($(this).text()).trigger('keyup');
		e.stopPropagation();
	});

	showWebFontsTrigger.click(function() {
		showWebFontsTrigger.hide();
		$('.webfonts-url').removeClass('hidden');
	});

	hideWebFontsTrigger.click(function() {
		showWebFontsTrigger.show();
		$('.webfonts-url').addClass('hidden');
	});

	helpTrigger.click(function() {
		if(helpBox.hasClass('show')) {
			helpBox.slideUp();
			helpTrigger.text('?');
		} else {
			helpBox.slideDown();
			helpTrigger.text('X');
		}
		helpBox.toggleClass('show');
	});

	$(document).click(function() {
		if(showWebsafeFontsTrigger.hasClass('show')) {
			toggleWebsafeFontsList();
		}
	});

	function toggleWebsafeFontsList() {
		if(showWebsafeFontsTrigger.hasClass('show')) {
			showWebsafeFontsTrigger.find('.icon').html('↓');
		} else {
			showWebsafeFontsTrigger.find('.icon').html('x');
		}
		showWebsafeFontsTrigger.toggleClass('show');
		websafeFontsList.toggleClass('show');
	}

	function convertToSlug(Text) {
    	return Text.toLowerCase().replace(/[^\w ]+/g,'').replace(/ +/g,'-');
	}
});