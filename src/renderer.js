const Papa = require('papaparse');
const nodemailer = require('nodemailer');
const { ipcRenderer } = require('electron');

// Initialize TinyMCE
tinymce.init({
    selector: '#emailTemplate',
    height: 400,
    plugins: 'link code table lists',
    toolbar: 'undo redo | formatselect | bold italic | alignleft aligncenter alignright | bullist numlist outdent indent | code'
});

// Add preview functionality
document.getElementById('previewBtn').addEventListener('click', () => {
    const csvFile = document.getElementById('csvFile').files[0];
    if (!csvFile) {
        alert('Please select a CSV file first');
        return;
    }

    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const results = Papa.parse(text, { header: true });
        if (results.data.length === 0) {
            alert('No data found in CSV file');
            return;
        }

        // Get the first row of data
        const firstRow = results.data[0];
        
        // Get email template and subject
        const emailContent = tinymce.get('emailTemplate').getContent();
        const subjectTemplate = document.getElementById('subjectTemplate').value;

        // Replace variables in subject and content
        let previewSubject = subjectTemplate;
        let previewContent = emailContent;

        // Replace all variables in both subject and content
        Object.keys(firstRow).forEach(key => {
            const value = firstRow[key] || '';
            const variable = `{{${key}}}`;
            previewSubject = previewSubject.replace(new RegExp(variable, 'g'), value);
            previewContent = previewContent.replace(new RegExp(variable, 'g'), value);
        });

        // Show the preview
        const previewDiv = document.getElementById('preview');
        previewDiv.innerHTML = `
            <div class="bg-gray-100 p-4 rounded">
                <div class="font-bold mb-2">Subject: ${previewSubject}</div>
                <div class="border-t pt-2">${previewContent}</div>
            </div>
        `;
        previewDiv.classList.remove('hidden');
    };

    reader.readAsText(csvFile);
});

// Add auth button handler
document.getElementById('authBtn').addEventListener('click', async () => {
    console.log('Auth button clicked');
    try {
        const tokens = await ipcRenderer.invoke('start-auth');
        if (tokens) {
            document.getElementById('authBtn').textContent = 'Authenticated, ready to send emails!';
            document.getElementById('authBtn').classList.remove('bg-blue-500');
            document.getElementById('authBtn').classList.add('bg-green-500');
        }
    } catch (error) {
        console.error('Authentication failed:', error);
        alert('Authentication failed. Please try again.');
    }
});

// Add recipient column change handler
document.getElementById('recipientColumn').addEventListener('change', async (e) => {
    const selectedColumn = e.target.value;
    if (!selectedColumn) return;

    const csvFile = document.getElementById('csvFile').files[0];
    if (!csvFile) {
        alert('Please select a CSV file first');
        return;
    }

    // Create or get the recipients dropdown
    let recipientsDropdown = document.getElementById('recipientsPreview');
    if (!recipientsDropdown) {
        const container = document.createElement('div');
        container.className = 'mb-6';
        container.innerHTML = `
            <label class="block mb-2">Recipients Preview</label>
            <select id="recipientsPreview" class="w-full border p-2 rounded bg-white" size="5" multiple>
            </select>
            <div class="text-sm text-gray-600 mt-1">
                Total recipients: <span id="recipientCount">0</span>
            </div>
        `;
        
        // Insert after recipient column selection
        document.getElementById('recipientColumn').parentElement.after(container);
        recipientsDropdown = container.querySelector('#recipientsPreview');
    }

    // Read and parse CSV
    const reader = new FileReader();
    reader.onload = function(e) {
        const text = e.target.result;
        const results = Papa.parse(text, { header: true });
        
        // Get unique recipients
        const recipients = [...new Set(
            results.data
                .map(row => row[selectedColumn])
                .filter(email => email && email.includes('@')) // Basic email validation
        )];

        // Update dropdown
        recipientsDropdown.innerHTML = recipients
            .map(email => `<option value="${email}">${email}</option>`)
            .join('');

        // Update count
        document.getElementById('recipientCount').textContent = recipients.length;
    };
    reader.readAsText(csvFile);
});

// Rest of the renderer.js code from the previous message