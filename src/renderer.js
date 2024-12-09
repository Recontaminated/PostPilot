const Papa = require('papaparse');
const nodemailer = require('nodemailer');

// Initialize TinyMCE
tinymce.init({
    selector: '#emailTemplate',
    height: 400,
    plugins: 'link code table lists',
    toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code'
});

// Rest of the renderer.js code from the previous message