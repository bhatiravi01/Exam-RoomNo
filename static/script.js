document.addEventListener('DOMContentLoaded', function () {
    
    // DOM Elements
    const themeToggle = document.getElementById('theme-toggle');
    const tabButtons = document.querySelectorAll('.tab-button');
    const tabContents = document.querySelectorAll('.tab-content');
    const studentForm = document.getElementById('student-form');
    const facultyForm = document.getElementById('faculty-form');
    const studentInput = document.getElementById('student-input');
    const facultyInput = document.getElementById('faculty-input');
    const studentResults = document.getElementById('student-results');
    const facultyResults = document.getElementById('faculty-results');
    const studentNoResults = document.getElementById('student-no-results');
    const facultyNoResults = document.getElementById('faculty-no-results');
    const studentTableBody = document.getElementById('student-table-body');
    const facultyTableBody = document.getElementById('faculty-table-body');
    const studentSearchTerm = document.getElementById('student-search-term');
    const facultySearchTerm = document.getElementById('faculty-search-term');
    const studentDownload = document.getElementById('student-download');
    const facultyDownload = document.getElementById('faculty-download');
    const toast = document.getElementById('toast');
    const toastMessage = document.getElementById('toast-message');
    const loading = document.getElementById('loading');

    // Theme Toggle
    themeToggle.addEventListener('click', () => {
        document.body.classList.toggle('dark-mode');
        document.body.classList.toggle('light-mode');

        // Save theme preference
        if (document.body.classList.contains('dark-mode')) {
            localStorage.setItem('theme', 'dark');
        } else {
            localStorage.setItem('theme', 'light');
        }
    });

    // Apply saved theme
    if (localStorage.getItem('theme') === 'dark') {
        document.body.classList.remove('light-mode');
        document.body.classList.add('dark-mode');
    }

    // Tab Navigation
    tabButtons.forEach(button => {
        button.addEventListener('click', () => {
            const tabName = button.getAttribute('data-tab');

            // Update active button
            tabButtons.forEach(btn => btn.classList.remove('active'));
            button.classList.add('active');

            // Show corresponding content
            tabContents.forEach(content => {
                content.classList.remove('active');
            });
            document.getElementById(`${tabName}-tab`).classList.add('active');
        });
    });

    // Form Submission Handlers
    studentForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const rollNo = studentInput.value.trim().toUpperCase();

        if (!rollNo) return;

        // Show loading
        showLoading();

        //fetch
        fetch(`/student/${rollNo}`)
            .then(data => data.json())
            .then((data)=>{
                if (data['detail']) throw new Error(data['detail'])
                const new_data = data.map((item) => {
                    return { 
                        rollNo: item['rollno'], 
                        examDay: item['day'], 
                        courseCode: item['coursecode'], 
                        date: item['date'], 
                        shift: item['shift'],
                        roomNo: item['roomno']
                    }
                });
                console.log(data);
                studentSearchTerm.textContent = rollNo;
                renderStudentResults(new_data);
                studentResults.style.display = 'block';
                studentNoResults.style.display = 'none';
            })
            .catch((error)=>{  
                studentSearchTerm.textContent = rollNo;
                renderStudentResults([]);
                studentResults.style.display = 'none';
                studentNoResults.style.display = 'block';
                console.log(`Error: ${error.message}`);
            })
            .finally(()=>{
                hideLoading();
            })
    });

    facultyForm.addEventListener('submit', (e) => {
        e.preventDefault();
        const courseCode = facultyInput.value.trim().toUpperCase();

        if (!courseCode) return;

        // Show loading
        showLoading();

        fetch(`/faculty/${courseCode}`)
            .then(data => data.json())
            .then( data =>{
                if(data['detail']) throw new Error(data['detail'])
                const new_data = data.map((item) => {
                    return { 
                        courseCode: item['coursecode'], 
                        day: item['day'], 
                        shift: item['shift'],
                        date: item['date'],  
                        roomNos: item['roomno']
                    }
                });
                console.log(data);
                facultySearchTerm.textContent = courseCode;
                renderFacultyResults(new_data);
                facultyResults.style.display = 'block';
                facultyNoResults.style.display = 'none';      
            })
            .catch(
                (error)=>{
                    facultySearchTerm.textContent = courseCode;
                    renderFacultyResults([]);
                    facultyResults.style.display = 'none';
                    facultyNoResults.style.display = 'block';
                    console.log(`Error: ${error.message}`)
                }
            ).finally(
                () => {
                    hideLoading();
                }
            )

        // Simulate API call
        // setTimeout(() => {
        //     hideLoading();

        //     
        //     // Check for matches
        //     if (courseCode === 'CS2207') {
        //         renderFacultyResults(mockCourseData);
        //         facultyResults.style.display = 'block';
        //         facultyNoResults.style.display = 'none';
        //     } else {
        //         facultyResults.style.display = 'none';
        //         facultyNoResults.style.display = 'block';
        //     }
        // }, 800);
    });

    // Render Results Functions
    function renderStudentResults(data) {
        studentTableBody.innerHTML = '';

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
          <td>${item.rollNo}</td>
          <td>${item.examDay}</td>
          <td>${item.courseCode}</td>
          <td>${item.date}</td>
          <td>${item.shift}</td>
          <td>${item.roomNo}</td>
        `;
            studentTableBody.appendChild(row);
        });
    }

    function renderFacultyResults(data) {
        facultyTableBody.innerHTML = '';

        data.forEach(item => {
            const row = document.createElement('tr');
            row.innerHTML = `
          <td>${item.courseCode}</td>
          <td>${item.day}</td>
          <td>${item.shift}</td>
          <td>${item.date}</td>
          <td>${item.roomNos}</td>
        `;
            facultyTableBody.appendChild(row);
        });
    }

    // Download Buttons
    studentDownload.addEventListener('click', () => {
        showToast('Excel file downloaded successfully');
    });

    facultyDownload.addEventListener('click', () => {
        showToast('Excel file downloaded successfully');
    });

    // Toast Function
    function showToast(message) {
        toastMessage.textContent = message;
        toast.classList.add('show');

        setTimeout(() => {
            toast.classList.remove('show');
        }, 3000);
    }

    // Loading Overlay Functions
    function showLoading() {
        loading.classList.add('show');
    }

    function hideLoading() {
        loading.classList.remove('show');
    }

    // Mobile Responsiveness - Adjust tab text based on screen size
    function updateTabText() {
        const isMobile = window.innerWidth < 640;
        const tabElements = document.querySelectorAll('.tab-text');

        tabElements.forEach(tab => {
            if (isMobile) {
                if (tab.textContent === 'Student Search') tab.textContent = 'Student';
                if (tab.textContent === 'Faculty Search') tab.textContent = 'Faculty';
            } else {
                if (tab.textContent === 'Student') tab.textContent = 'Student Search';
                if (tab.textContent === 'Faculty') tab.textContent = 'Faculty Search';
            }
        });
    }

    // Initial call and event listener for resize
    updateTabText();
    window.addEventListener('resize', updateTabText);
});
