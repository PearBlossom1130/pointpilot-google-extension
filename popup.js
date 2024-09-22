// At the top of your popup.js file
let ENCRYPTION_KEY = ''; // This will be set later

// Encryption function
function encrypt(text) {
    return CryptoJS.AES.encrypt(text, ENCRYPTION_KEY).toString();
}

// Decryption function
function decrypt(ciphertext) {
    if (!ciphertext) return '';
    if (!ENCRYPTION_KEY) {
        console.error('Encryption key not set');
        return '';
    }
    try {
        const bytes = CryptoJS.AES.decrypt(ciphertext, ENCRYPTION_KEY);
        return bytes.toString(CryptoJS.enc.Utf8);
    } catch (error) {
        console.error('Decryption error:', error);
        return '';
    }
}

document.addEventListener('DOMContentLoaded', function() {
    console.log('DOM content loaded');
    const addCardButton = document.getElementById('addCard');
    const saveLocallyButton = document.getElementById('saveLocally');
    const cardNameSelect = document.getElementById('cardName');
    const newCardNameInput = document.getElementById('newCardName');
    const applicantNameInput = document.getElementById('applicantName');
    const applicantEmailInput = document.getElementById('applicantEmail');
    const applicantPhoneInput = document.getElementById('applicantPhone');
    const applicantList = document.getElementById('applicantList');
    const emailList = document.getElementById('emailList');
    const phoneList = document.getElementById('phoneList');
    const lastFourDigitsInput = document.getElementById('lastFourDigits');
    const applicationDateInput = document.getElementById('applicationDate');
    const annualFeeDateInput = document.getElementById('annualFeeDate');
    const churningMonthsInput = document.getElementById('churningMonths');
    const hasAnnualFeeRadios = document.querySelectorAll('input[name="hasAnnualFee"]');
    const annualFeeAmountInput = document.getElementById('annualFeeAmount');
    const annualFeeDateContainer = document.getElementById('annualFeeDateContainer');
    const cardList = document.getElementById('cardList');
    const cardBenefitsInput = document.getElementById('cardBenefits');
    const cardWebsiteInput = document.getElementById('cardWebsite');
    const cardUsernameInput = document.getElementById('cardUsername');
    const cardPasswordInput = document.getElementById('cardPassword');
    const togglePasswordButton = document.getElementById('togglePassword');

    let cards = [];

    // Email validation function
    function isValidEmail(email) {
        const re = /^(([^<>()\[\]\\.,;:\s@"]+(\.[^<>()\[\]\\.,;:\s@"]+)*)|(".+"))@((\[[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}\.[0-9]{1,3}])|(([a-zA-Z\-0-9]+\.)+[a-zA-Z]{2,}))$/;
        return re.test(String(email).toLowerCase());
    }

    // US phone number validation function
    function isValidUSPhone(phone) {
        const re = /^(\+1|1)?[-.\s]?\(?[2-9]\d{2}\)?[-.\s]?\d{3}[-.\s]?\d{4}$/;
        return re.test(phone);
    }

    // Format US phone number
    function formatUSPhone(phone) {
        const cleaned = ('' + phone).replace(/\D/g, '');
        const match = cleaned.match(/^(1|)?(\d{3})(\d{3})(\d{4})$/);
        if (match) {
            const intlCode = (match[1] ? '+1 ' : '');
            return [intlCode, '(', match[2], ') ', match[3], '-', match[4]].join('');
        }
        return null;
    }

    // Initialize the encryption key
    initializeEncryptionKey().then(() => {
        // Load and display cards
        loadCards();
    });

    // Handle annual fee radio buttons
    hasAnnualFeeRadios.forEach(radio => {
        radio.addEventListener('change', function() {
            const hasAnnualFee = this.value === 'yes';
            annualFeeAmountInput.disabled = !hasAnnualFee;
            annualFeeDateContainer.style.display = hasAnnualFee ? 'block' : 'none';
            if (!hasAnnualFee) {
                annualFeeAmountInput.value = '';
                annualFeeDateInput.value = '';
            }
        });
    });

    // Set today's date as default for application date
    const today = new Date().toISOString().split('T')[0];
    applicationDateInput.value = today;

    // Handle applicant name selection
    applicantNameInput.addEventListener('input', function() {
        if (this.value.trim() === '') {
            applicantList.innerHTML = '';
        } else {
            const applicantNames = new Set(cards.map(card => card.applicantName));
            applicantList.innerHTML = '';
            applicantNames.forEach(name => {
                const option = document.createElement('option');
                option.value = name;
                applicantList.appendChild(option);
            });
        }
    });

    // Add new card
    addCardButton.addEventListener('click', function() {
        console.log('Add card button clicked');
        let cardName = cardNameSelect.value;
        if (cardName === "" && newCardNameInput.value !== "") {
            cardName = newCardNameInput.value;
            addOptionToSelect(cardNameSelect, cardName);
        }
        const applicantName = applicantNameInput.value.trim();
        const applicantEmail = applicantEmailInput.value.trim();
        const applicantPhone = applicantPhoneInput.value.trim();
        const lastFourDigits = lastFourDigitsInput.value;
        const applicationDate = applicationDateInput.value;
        const churningMonths = churningMonthsInput.value;
        const hasAnnualFee = document.querySelector('input[name="hasAnnualFee"]:checked').value === 'yes';
        const annualFeeAmount = annualFeeAmountInput.value;
        const annualFeeDate = annualFeeDateInput.value;
        const cardBenefits = cardBenefitsInput.value.trim();
        const cardWebsite = cardWebsiteInput.value.trim();
        const cardUsername = cardUsernameInput.value.trim();
        const cardPassword = cardPasswordInput.value;

        if (cardName && applicantName && lastFourDigits && applicationDate) {
            if (applicantEmail && !isValidEmail(applicantEmail)) {
                alert('Please enter a valid email address.');
                return;
            }
            if (applicantPhone && !isValidUSPhone(applicantPhone)) {
                alert('Please enter a valid US phone number (e.g., 123-456-7890).');
                return;
            }

            const formattedPhone = applicantPhone ? formatUSPhone(applicantPhone) : '';

            const newCard = { 
                name: cardName,
                applicantName: applicantName,
                applicantEmail: applicantEmail,
                applicantPhone: formattedPhone,
                lastFourDigits: lastFourDigits,
                applicationDate: applicationDate,
                annualFeeDate: annualFeeDate || '9999-12-31',
                churningMonths: churningMonths || '',
                hasAnnualFee: hasAnnualFee,
                annualFeeAmount: annualFeeAmount,
                benefits: cardBenefits,
                website: cardWebsite,
                username: cardUsername,
                password: cardPassword ? encrypt(cardPassword) : '',
                benefitReceived: false // New property added
            };
            console.log('Adding new card:', newCard);
            cards.push(newCard);
            saveCards();
            resetForm();
            displayCards();
            populateApplicantNames(); // Update applicant list
            // Switch to card list tab
            document.querySelector('.tablinks:nth-child(2)').click();
        } else {
            alert('Please fill in all required fields (Card Name, Applicant Name, Last 4 Digits, and Application Date).');
        }
    });

    // Save to local file
    saveLocallyButton.addEventListener('click', function() {
        saveCards();
        saveAsCSV();
    });

    function loadCards() {
        console.log('Loading cards');
        chrome.storage.local.get(['cards'], function(result) {
            console.log('Loaded cards:', result.cards);
            cards = result.cards || [];
            displayCards();
            populateApplicantNames();
        });
    }

    function populateApplicantNames() {
        const applicantNames = new Set(cards.map(card => card.applicantName));
        const emails = new Set(cards.map(card => card.applicantEmail).filter(Boolean));
        const phones = new Set(cards.map(card => card.applicantPhone).filter(Boolean));

        applicantList.innerHTML = '';
        emailList.innerHTML = '';
        phoneList.innerHTML = '';

        applicantNames.forEach(name => {
            const option = document.createElement('option');
            option.value = name;
            applicantList.appendChild(option);
        });

        emails.forEach(email => {
            const option = document.createElement('option');
            option.value = email;
            emailList.appendChild(option);
        });

        phones.forEach(phone => {
            const option = document.createElement('option');
            option.value = phone;
            phoneList.appendChild(option);
        });
    }

    function addOptionToSelect(selectElement, value) {
        const option = document.createElement('option');
        option.value = value;
        option.textContent = value;
        selectElement.appendChild(option);
    }

    function saveCards() {
        console.log('Saving cards:', cards);
        chrome.storage.local.set({ cards: cards }, function() {
            console.log('Cards saved');
        });
    }

    function displayCards() {
        console.log('Displaying cards:', cards);
        cardList.innerHTML = '';
        cards.forEach((card, index) => {
            const cardElement = createCardElement(card, index);
            cardList.appendChild(cardElement);
        });
        addCardEventListeners();
    }

    function createCardElement(card, index) {
        const cardElement = document.createElement('div');
        cardElement.className = 'card-info';
        cardElement.setAttribute('data-index', index);

        const churningDate = calculateChurningDate(card.applicationDate, card.churningMonths);
        const annualFeeHtml = createAnnualFeeHtml(card);

        cardElement.innerHTML = `
            <h3>${card.name}</h3>
            ${createInfoParagraph('Last 4 digits', card.lastFourDigits)}
            ${createInfoParagraph('Applicant', card.applicantName)}
            ${createInfoParagraph('Email', card.applicantEmail)}
            ${createInfoParagraph('Phone', card.applicantPhone)}
            ${createInfoParagraph('Application date', card.applicationDate)}
            ${annualFeeHtml}
            ${createInfoParagraph('Churning months', card.churningMonths)}
            ${createInfoParagraph('Churning possible date', churningDate)}
            ${createInfoParagraph('Benefits', card.benefits)}
            <p>
                <label class="benefit-received-label">
                    <span>Benefit Received</span>
                    <input type="checkbox" class="benefit-received" data-index="${index}" ${card.benefitReceived ? 'checked' : ''} disabled>
                </label>
            </p>
            ${createInfoParagraph('Website', card.website, true)}
            ${createInfoParagraph('Username', card.username)}
            ${createPasswordParagraph(card.password, index)}
            <button class="edit-button" data-index="${index}">Edit</button>
            <button class="remove-button" data-index="${index}">Remove</button>
        `;

        return cardElement;
    }

    function createInfoParagraph(label, value, isLink = false) {
        if (!value) return `<p><strong>${label}:</strong> N/A</p>`;
        if (isLink) {
            return `<p><strong>${label}:</strong> <a href="${value}" target="_blank">${value}</a></p>`;
        }
        if (label === 'Username') {
            return createInfoParagraphWithCopy(label, value, 'username');
        }
        return `<p><strong>${label}:</strong> ${value}</p>`;
    }

    function createInfoParagraphWithCopy(label, value, id) {
        return `
            <p>
                <strong>${label}:</strong>
                <span class="value-with-copy">
                    <span id="${id}">${value}</span>
                    <button type="button" class="copy-button" data-target="${id}" title="Copy ${label}">📋</button>
                </span>
            </p>
        `;
    }

    function createPasswordParagraph(password, index) {
        return `
            <p><strong>Password:</strong> 
                <span class="password-container">
                    <span id="password${index}">${'•'.repeat(decrypt(password).length)}</span>
                    <button type="button" class="togglePassword" data-index="${index}">👁️</button>
                    <button type="button" class="copy-button" data-target="password${index}" title="Copy Password">📋</button>
                </span>
            </p>
        `;
    }

    function createAnnualFeeHtml(card) {
        if (!card.hasAnnualFee) return '<p><strong>Annual fee:</strong> None</p>';
        
        let html = `<p><strong>Annual fee:</strong> $${parseFloat(card.annualFeeAmount).toFixed(2)}`;
        if (parseFloat(card.annualFeeAmount) > 0) {
            html += `<br><strong>Annual fee date:</strong> ${card.annualFeeDate !== '9999-12-31' ? card.annualFeeDate : 'N/A'}`;
        }
        return html + '</p>';
    }

    function calculateChurningDate(applicationDate, churningMonths) {
        const date = new Date(applicationDate);
        date.setMonth(date.getMonth() + parseInt(churningMonths || 0));
        return date.toISOString().split('T')[0];
    }

    function addCardEventListeners() {
        document.querySelectorAll('.togglePassword').forEach(button => {
            button.addEventListener('click', togglePassword);
        });

        document.querySelectorAll('.edit-button').forEach(button => {
            button.addEventListener('click', editCard);
        });

        document.querySelectorAll('.remove-button').forEach(button => {
            button.addEventListener('click', removeCard);
        });

        document.querySelectorAll('.copy-button').forEach(button => {
            button.addEventListener('click', copyToClipboard);
        });
    }

    function togglePassword(event) {
        const index = event.target.getAttribute('data-index');
        const passwordSpan = document.getElementById(`password${index}`);
        if (passwordSpan.textContent.includes('•')) {
            passwordSpan.textContent = decrypt(cards[index].password);
            event.target.textContent = '🙈';
        } else {
            passwordSpan.textContent = '•'.repeat(decrypt(cards[index].password).length);
            event.target.textContent = '👁️';
        }
    }

    function editCard(event) {
        const index = parseInt(event.target.getAttribute('data-index'));
        const card = cards[index];
        showEditForm(card, index);
    }

    function removeCard(event) {
        const index = parseInt(event.target.getAttribute('data-index'));
        if (confirm('Are you sure you want to remove this card?')) {
            cards.splice(index, 1);
            saveCards();
            displayCards();
        }
    }

    function copyToClipboard(event) {
        const targetId = event.target.getAttribute('data-target');
        const targetElement = document.getElementById(targetId);
        let textToCopy = targetElement.textContent;

        // 비밀번호인 경우 복호화된 값을 복사
        if (targetId.startsWith('password')) {
            const index = targetId.replace('password', '');
            textToCopy = decrypt(cards[index].password);
        }

        navigator.clipboard.writeText(textToCopy).then(() => {
            alert('Copied to clipboard!');
        }).catch(err => {
            console.error('Failed to copy: ', err);
        });
    }

    function showEditForm(card, index) {
        const cardElement = document.querySelector(`.card-info[data-index="${index}"]`);
        if (!cardElement) {
            console.error('Card element not found');
            return;
        }

        const originalContent = cardElement.innerHTML;
        
        cardElement.innerHTML = `
            <form class="edit-form">
                <div class="form-group">
                    <label for="editCardName">Card Name:</label>
                    <input type="text" id="editCardName" value="${card.name}" required>
                </div>
                <div class="form-group">
                    <label for="editApplicantName">Applicant Name:</label>
                    <input type="text" id="editApplicantName" value="${card.applicantName}" required>
                </div>
                <div class="form-group">
                    <label for="editApplicantEmail">Email:</label>
                    <input type="email" id="editApplicantEmail" value="${card.applicantEmail || ''}" placeholder="Email">
                </div>
                <div class="form-group">
                    <label for="editApplicantPhone">Phone Number:</label>
                    <input type="tel" id="editApplicantPhone" value="${card.applicantPhone || ''}" placeholder="Phone Number">
                </div>
                <div class="form-group">
                    <label for="editLastFourDigits">Last 4 Digits:</label>
                    <input type="text" id="editLastFourDigits" value="${card.lastFourDigits}" maxlength="4" pattern="\\d{4}" required>
                </div>
                <div class="form-group">
                    <label for="editApplicationDate">Application Date:</label>
                    <input type="date" id="editApplicationDate" value="${card.applicationDate}" required>
                </div>
                <div class="form-group">
                    <label>Has Annual Fee:</label>
                    <div class="radio-group">
                        <label>
                            <input type="radio" name="editHasAnnualFee" value="yes" ${card.hasAnnualFee ? 'checked' : ''}>
                            Yes
                        </label>
                        <label>
                            <input type="radio" name="editHasAnnualFee" value="no" ${!card.hasAnnualFee ? 'checked' : ''}>
                            No
                        </label>
                    </div>
                </div>
                <div class="form-group">
                    <label for="editAnnualFeeAmount">Annual Fee Amount:</label>
                    <input type="number" id="editAnnualFeeAmount" value="${card.annualFeeAmount}" ${card.hasAnnualFee ? '' : 'disabled'} step="0.01" min="0">
                </div>
                <div class="form-group">
                    <label for="editAnnualFeeDate">Annual Fee Date:</label>
                    <input type="date" id="editAnnualFeeDate" value="${card.annualFeeDate === '9999-12-31' ? '' : card.annualFeeDate}" ${card.hasAnnualFee ? '' : 'disabled'}>
                </div>
                <div class="form-group">
                    <label for="editChurningMonths">Churning Months:</label>
                    <input type="number" id="editChurningMonths" value="${card.churningMonths || ''}" placeholder="Months until reapplication (e.g., 24)" min="0">
                </div>
                <div class="form-group">
                    <label for="editCardWebsite">Card Website:</label>
                    <input type="url" id="editCardWebsite" value="${card.website || ''}" placeholder="Card Website URL">
                </div>
                 <div class="form-group">
                    <label for="editCardUsername">Website Username:</label>
                    <div class="input-with-copy">
                        <input type="text" id="editCardUsername" value="${card.username || ''}" placeholder="Card Website Username">
                        <button type="button" class="copy-button" data-target="editCardUsername">Copy</button>
                    </div>
                </div>
                <div class="form-group">
                    <label for="editCardPassword">Website Password:</label>
                    <div class="input-with-copy">
                        <div class="password-container">
                            <input type="password" id="editCardPassword" value="${decrypt(card.password) || ''}" placeholder="Card Website Password">
                            <button type="button" id="editTogglePassword">👁️</button>
                        </div>
                        <button type="button" class="copy-button" data-target="editCardPassword">Copy</button>
                    </div>
                </div>
                <div class="form-group">
                    <label for="editCardBenefits">Card Benefits:</label>
                    <textarea id="editCardBenefits" placeholder="Enter card benefits">${card.benefits || ''}</textarea>
                </div>
                <div class="form-group">
                    <label class="benefit-received-label">
                        <input type="checkbox" id="editBenefitReceived" ${card.benefitReceived ? 'checked' : ''}>
                        <span>Benefit Received</span>
                    </label>
                </div>
                <button type="submit">Save Changes</button>
                <button type="button" id="cancelEdit">Cancel</button>
            </form>
        `;

        const editForm = cardElement.querySelector('.edit-form');
        const editAnnualFeeRadios = editForm.querySelectorAll('input[name="editHasAnnualFee"]');
        const editAnnualFeeAmountInput = editForm.querySelector('#editAnnualFeeAmount');
        const editAnnualFeeDateInput = editForm.querySelector('#editAnnualFeeDate');

        editAnnualFeeRadios.forEach(radio => {
            radio.addEventListener('change', function() {
                const hasAnnualFee = this.value === 'yes';
                editAnnualFeeAmountInput.disabled = !hasAnnualFee;
                editAnnualFeeDateInput.disabled = !hasAnnualFee;
            });
        });

        const copyButtons = cardElement.querySelectorAll('.copy-button');
            copyButtons.forEach(button => {
                button.addEventListener('click', function() {
                    const targetId = this.getAttribute('data-target');
                    const targetInput = document.getElementById(targetId);
                    targetInput.select();
                    document.execCommand('copy');
                    alert('Copied to clipboard!');
            });
        });

        const editTogglePasswordButton = editForm.querySelector('#editTogglePassword');
        const editCardPasswordInput = editForm.querySelector('#editCardPassword');

        editTogglePasswordButton.addEventListener('click', function() {
            if (editCardPasswordInput.type === 'password') {
                editCardPasswordInput.type = 'text';
                editTogglePasswordButton.textContent = '🙈';
            } else {
                editCardPasswordInput.type = 'password';
                editTogglePasswordButton.textContent = '👁️';
            }
        });

        editForm.addEventListener('submit', function(e) {
            e.preventDefault();
            updateCard(index);
        });

        const cancelEditButton = editForm.querySelector('#cancelEdit');
        cancelEditButton.addEventListener('click', function() {
            cardElement.innerHTML = originalContent;
        });
    }

    function updateCard(index) {
        const cardElement = document.querySelector(`.card-info[data-index="${index}"]`);
        const editForm = cardElement.querySelector('.edit-form');
        
        const updatedCard = {
            name: editForm.querySelector('#editCardName').value,
            applicantName: editForm.querySelector('#editApplicantName').value,
            applicantEmail: editForm.querySelector('#editApplicantEmail').value,
            applicantPhone: editForm.querySelector('#editApplicantPhone').value,
            lastFourDigits: editForm.querySelector('#editLastFourDigits').value,
            applicationDate: editForm.querySelector('#editApplicationDate').value,
            hasAnnualFee: editForm.querySelector('input[name="editHasAnnualFee"]:checked').value === 'yes',
            annualFeeAmount: editForm.querySelector('#editAnnualFeeAmount').value,
            annualFeeDate: editForm.querySelector('#editAnnualFeeDate').value || '9999-12-31',
            churningMonths: editForm.querySelector('#editChurningMonths').value,
            website: editForm.querySelector('#editCardWebsite').value,
            username: editForm.querySelector('#editCardUsername').value,
            password: encrypt(editForm.querySelector('#editCardPassword').value),
            benefits: editForm.querySelector('#editCardBenefits').value,
            benefitReceived: editForm.querySelector('#editBenefitReceived').checked
        };

        cards[index] = updatedCard;
        saveCards();
        displayCards();
    }

    function resetForm() {
        cardNameSelect.value = "";
        newCardNameInput.value = "";
        applicantNameInput.value = "";
        applicantEmailInput.value = "";
        applicantPhoneInput.value = "";
        lastFourDigitsInput.value = "";
        applicationDateInput.value = today; // Reset to today's date
        annualFeeDateInput.value = "";
        churningMonthsInput.value = "";
        hasAnnualFeeRadios.forEach(radio => {
            if (radio.value === 'no') {
                radio.checked = true;
            }
        });
        annualFeeAmountInput.value = "";
        annualFeeAmountInput.disabled = true;
        annualFeeDateContainer.style.display = 'none';
        cardBenefitsInput.value = "";
        cardWebsiteInput.value = "";
        cardUsernameInput.value = "";
        cardPasswordInput.value = "";
    }

    // Tab functionality
    const tabButtons = document.querySelectorAll('.tablinks');
    const tabContents = document.querySelectorAll('.tabcontent');

    tabButtons.forEach(button => {
        button.addEventListener('click', function() {
            const tabName = this.textContent.trim();
            
            tabContents.forEach(content => {
                content.style.display = 'none';
            });

            tabButtons.forEach(btn => {
                btn.classList.remove('active');
            });

            if (tabName === 'Add Card') {
                document.getElementById('InputTab').style.display = 'block';
            } else if (tabName === 'Card List') {
                document.getElementById('CardListTab').style.display = 'block';
                displayCards(); // Refresh card list when opening the tab
            }

            this.classList.add('active');
        });
    });

    // Open default tab
    document.getElementById("cardListTab").click();

    function saveAsCSV() {
        let csvContent = "data:text/csv;charset=utf-8,";
        
        // Add headers
        csvContent += "Card Name,Applicant Name,Email,Phone,Last 4 Digits,Application Date,Annual Fee,Annual Fee Date,Churning Months,Churning Possible Date,Benefits,Website,Username\n";
        
        // Add data rows
        cards.forEach(function(card) {
            const churningDate = new Date(card.applicationDate);
            churningDate.setMonth(churningDate.getMonth() + parseInt(card.churningMonths || 0));
            const churningPossibleDate = churningDate.toISOString().split('T')[0];
            
            const row = [
                card.name,
                card.applicantName,
                card.applicantEmail || '',
                card.applicantPhone || '',
                card.lastFourDigits,
                card.applicationDate,
                card.hasAnnualFee ? '$' + parseFloat(card.annualFeeAmount).toFixed(2) : 'None',
                card.hasAnnualFee && card.annualFeeDate !== '9999-12-31' ? card.annualFeeDate : 'N/A',
                card.churningMonths || '',
                churningPossibleDate,
                card.benefits || '',
                card.website || '',
                card.username || ''
                // Note: We're not including the password in the CSV for security reasons
            ];
            
            csvContent += row.map(field => `"${field}"`).join(",") + "\n";
        });
        
        // Create a download link and trigger the download
        const encodedUri = encodeURI(csvContent);
        const link = document.createElement("a");
        link.setAttribute("href", encodedUri);
        link.setAttribute("download", "credit_cards.csv");
        document.body.appendChild(link);
        link.click();
        document.body.removeChild(link);
    }

    // Toggle password visibility
    togglePasswordButton.addEventListener('click', function() {
        if (cardPasswordInput.type === 'password') {
            cardPasswordInput.type = 'text';
            togglePasswordButton.textContent = '🙈';
        } else {
            cardPasswordInput.type = 'password';
            togglePasswordButton.textContent = '👁️';
        }
    });

    // Function to initialize the encryption key
    function initializeEncryptionKey() {
        return new Promise((resolve) => {
            chrome.storage.local.get(['encryptionKey'], function(result) {
                if (result.encryptionKey) {
                    ENCRYPTION_KEY = result.encryptionKey;
                    resolve();
                } else {
                    const userPassword = prompt("First time use. Please set a master password:");
                    ENCRYPTION_KEY = CryptoJS.SHA256(userPassword).toString();
                    chrome.storage.local.set({encryptionKey: ENCRYPTION_KEY}, function() {
                        resolve();
                    });
                }
            });
        });
    }
});