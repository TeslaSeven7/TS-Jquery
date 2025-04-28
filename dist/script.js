
//Selecting simple elements
const title = $('.title');
console.log('Simple selector : ', title);

//Selecting more complex types of elements
const input = $('input:not([type="text"])');
console.log('Selector type Input : ', input);

//Selecting data-attributes
const getAttrInput = input.getAttr('data-attr')
console.log('getAttr : ', getAttrInput);

// Change DOM elements
const changeHtml = $('.change-html');
changeHtml.html('This text has been changed via EQuery !');

//Setting new data-attributes
title.setAttr('data-attr', 'Je suis un attribut qui a changé !');
console.log('setAttr : ', title.getAttr('data-attr'));

//Adding CSS
const textRed = $('.text-red');
textRed.css({
    "color": "red",
    "text-decoration": "underline",
});
//Adding classes
textRed.addClass('bold');

//Removing classes
const removeBold = $('#removeClass');
removeBold.removeClass('bold');

//Event Handling
const submittButton = $('#submitButton');
submittButton.on('click', (e) => {
    e.preventDefault()
    alert('Button clicked OR Hovered !');
});

// $(this) key whord and selector inside event handler
const textOnClick = $('.change-onclick');
textOnClick.on('click', function (e) {
    e.preventDefault();
    console.log($(this)); 
    $(this).html('OMG SO NICE !').css('color', 'blue').addClass('bold');
});


// Chaining any methods
$('.card')
.css({
    'margin-top': '20px'
})
.find('button')
.css({
    'padding' : '6px 42px',
    'background' : '#ffffff',
    'border' : '1px solid #000000',
    'border-radius': '4px',
})
.addClass('highlighted')
.on('click', function (e) {
    console.log($(this)); 
    $(this).html('BOUH !');
});

// Children() method
const form = $('form');
form.children().addClass('form-child');
form.children().each((child) => {
    console.log('Form Child : ', child);
});

console.log('Form Children: ', form.children().elements);
console.log('Form Parent: ', form.parent().elements);
console.log('Form Parents: ', form.parents().elements);
console.log('Form Siblings: ', form.siblings().elements);
console.log('Form Prev: ', form.prev().elements);
console.log('Form closest H1: ', form.closest('input').elements);
console.log('Form first input: ', form.first('input').elements);
console.log('Form last input: ', form.last('input').elements);


const checkbox = $('.checkbox');
checkbox.on('click', function (e) {
    e.preventDefault();
    $(this).toggleClass('checked');
});

const textElement = $('.text-element');

console.log(textElement.text(''));

textElement.text('Text changé via .text()! ');

//Error Handling
console.log($('input:exempleError'));