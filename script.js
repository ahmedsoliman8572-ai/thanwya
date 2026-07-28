document.addEventListener('DOMContentLoaded', () => {
    const searchBtn = document.getElementById('searchBtn');
    const seatNumberInput = document.getElementById('seatNumberInput');
    const loading = document.getElementById('loading');
    const errorMessage = document.getElementById('errorMessage');
    const resultSection = document.getElementById('resultSection');
    
    // Result fields
    const studentName = document.getElementById('studentName');
    const seatNumberDisplay = document.getElementById('seatNumberDisplay');
    const totalDegree = document.getElementById('totalDegree');
    const studentStatus = document.getElementById('studentStatus');
    const scoreProgress = document.getElementById('scoreProgress');

    function showError(msg) {
        errorMessage.textContent = msg;
        errorMessage.classList.remove('hidden');
        resultSection.classList.add('hidden');
        loading.classList.add('hidden');
    }

    function hideError() {
        errorMessage.classList.add('hidden');
    }

    async function handleSearch() {
        const query = seatNumberInput.value.trim();
        hideError();
        resultSection.classList.add('hidden');
        
        if (!query) {
            showError('الرجاء إدخال رقم الجلوس');
            return;
        }

        loading.classList.remove('hidden');

        try {
            // Calculate which tiny file this seat number belongs to
            const seatPrefix = Math.floor(parseInt(query) / 20000);
            
            const response = await fetch(`api_data/${seatPrefix}.json`);
            
            if (!response.ok) {
                loading.classList.add('hidden');
                showError('رقم الجلوس غير موجود. تأكد من الرقم وحاول مرة أخرى.');
                return;
            }
            
            const groupData = await response.json();
            
            // Search inside the tiny file
            const student = groupData.find(s => {
                const keys = Object.keys(s);
                return s['رقم الجلوس'] == query || 
                       s['seat_number'] == query || 
                       s['Seat Number'] == query || 
                       s[keys[0]] == query;
            });
            
            loading.classList.add('hidden');
            
            if (student) {
                displayResult(student);
            } else {
                showError('رقم الجلوس غير موجود. تأكد من الرقم وحاول مرة أخرى.');
            }
        } catch (error) {
            loading.classList.add('hidden');
            console.error('Error fetching data:', error);
            showError('حدث خطأ أثناء الاتصال بالسيرفر. يرجى المحاولة لاحقاً.');
        }
    }

    function displayResult(student) {
        const keys = Object.keys(student);
        // Find keys dynamically based on common naming patterns in both Arabic and English
        const nameKey = keys.find(k => typeof k === 'string' && (k.toLowerCase().includes('name') || k.includes('الاسم') || k.includes('اسم'))) || keys[1];
        const seatKey = keys.find(k => typeof k === 'string' && (k.toLowerCase().includes('seat') || k.includes('جلوس'))) || keys[0];
        const degreeKey = keys.find(k => typeof k === 'string' && (k.toLowerCase().includes('degree') || k.toLowerCase().includes('total') || k.includes('مجموع'))) || keys[2];
        const statusKey = keys.find(k => typeof k === 'string' && (k.toLowerCase().includes('case') || k.toLowerCase().includes('status') || k.includes('حالة'))) || keys[3];

        studentName.textContent = student[nameKey] || 'غير متوفر';
        seatNumberDisplay.textContent = student[seatKey] || 'غير متوفر';
        
        const degreeStr = student[degreeKey];
        const degree = parseFloat(degreeStr);
        totalDegree.textContent = isNaN(degree) ? (degreeStr || 'غير متوفر') : degree;
        
        const status = student[statusKey] || '';
        studentStatus.textContent = status;
        
        if (status.includes('ناجح')) {
            studentStatus.className = 'status badge success';
        } else {
            studentStatus.className = 'status badge';
            studentStatus.style.background = 'rgba(245, 158, 11, 0.1)';
            studentStatus.style.color = '#f59e0b';
            studentStatus.style.border = '1px solid rgba(245, 158, 11, 0.2)';
        }

        resultSection.classList.remove('hidden');

        // Animate progress bar
        if (!isNaN(degree)) {
            const maxScore = 320; // Max score for Thanaweya Amma
            const percentage = Math.min((degree / maxScore) * 100, 100);
            
            scoreProgress.style.width = '0%';
            setTimeout(() => {
                scoreProgress.style.width = `${percentage}%`;
            }, 100);
        } else {
            scoreProgress.style.width = '0%';
        }
    }

    searchBtn.addEventListener('click', handleSearch);
    seatNumberInput.addEventListener('keypress', (e) => {
        if (e.key === 'Enter') {
            handleSearch();
        }
    });
});
