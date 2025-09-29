// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyCctRA8GcMlYNvk6nBE1YXeYruQwkawcHA",
  authDomain: "daily-tasks-a69ab.firebaseapp.com",
  databaseURL: "https://daily-tasks-a69ab-default-rtdb.firebaseio.com",
  projectId: "daily-tasks-a69ab",
  storageBucket: "daily-tasks-a69ab.firebasestorage.app",
  messagingSenderId: "799210899623",
  appId: "1:799210899623:web:2cc09163c30bdd1db4b382",
  measurementId: "G-0B95KRGK2S"
};

// تهيئة Firebase
firebase.initializeApp(firebaseConfig);
const database = firebase.database();

// عناصر DOM
const daysGrid = document.getElementById('days-grid');
const daysSelection = document.getElementById('days-selection');
const tasksView = document.getElementById('tasks-view');
const tasksList = document.getElementById('tasks-list');
const selectedDayTitle = document.getElementById('selected-day-title');
const backBtn = document.getElementById('back-btn');
const loading = document.getElementById('loading');

// أيام الأسبوع
const daysOfWeek = [
    { id: 'sunday', name: 'الأحد', label: 'يوم الأحد' },
    { id: 'monday', name: 'الاثنين', label: 'يوم الاثنين' },
    { id: 'tuesday', name: 'الثلاثاء', label: 'يوم الثلاثاء' },
    { id: 'wednesday', name: 'الأربعاء', label: 'يوم الأربعاء' },
    { id: 'thursday', name: 'الخميس', label: 'يوم الخميس' },
];

// تهيئة التطبيق
function initApp() {
    renderDaysGrid();
    setupEventListeners();
    // لا نحتاج لتحميل البيانات مسبقاً، سيتم تحميلها عند اختيار يوم
}

// عرض شبكة الأيام
function renderDaysGrid() {
    daysGrid.innerHTML = '';
    
    daysOfWeek.forEach(day => {
        const dayCard = document.createElement('div');
        dayCard.className = 'day-card';
        dayCard.dataset.dayId = day.id;
        
        dayCard.innerHTML = `
            <h3>${day.name}</h3>
            <p>عرض الواجبات</p>
        `;
        
        daysGrid.appendChild(dayCard);
    });
}

// إعداد مستمعي الأحداث
function setupEventListeners() {
    // النقر على بطاقة اليوم
    daysGrid.addEventListener('click', (e) => {
        const dayCard = e.target.closest('.day-card');
        if (dayCard) {
            const dayId = dayCard.dataset.dayId;
            const day = daysOfWeek.find(d => d.id === dayId);
            if (day) {
                showTasksForDay(day);
            }
        }
    });
    
    // زر العودة
    backBtn.addEventListener('click', showDaysSelection);
}

// عرض الواجبات ليوم معين
function showTasksForDay(day) {
    showLoading(true);
    
    // تحديث العنوان
    selectedDayTitle.textContent = `الواجبات ل${day.label}`;
    
    // الانتقال إلى شاشة الواجبات
    daysSelection.classList.add('hidden');
    tasksView.classList.remove('hidden');
    
    // جلب البيانات من Firebase
    database.ref(`tasks/${day.id}`).once('value')
        .then(snapshot => {
            showLoading(false);
            const tasks = snapshot.val();
            renderTasksList(tasks, day);
        })
        .catch(error => {
            showLoading(false);
            console.error('Error fetching tasks:', error);
            renderTasksList(null, day, true);
        });
}

// عرض قائمة الواجبات
function renderTasksList(tasks, day, isError = false) {
    tasksList.innerHTML = '';
    
    if (isError) {
        tasksList.innerHTML = `
            <li class="task-item">
                <h3>خطأ في تحميل البيانات</h3>
                <p>تعذر تحميل الواجبات ل${day.label}. يرجى المحاولة مرة أخرى.</p>
            </li>
        `;
        return;
    }
    
    if (!tasks) {
        tasksList.innerHTML = `
            <li class="task-item">
                <h3>لا توجد واجبات</h3>
                <p>لا توجد واجبات مسجلة ل${day.label}.</p>
            </li>
        `;
        return;
    }
    
    // تحويل كائن المهام إلى مصفوفة
    const tasksArray = Object.entries(tasks).map(([id, task]) => ({
        id,
        ...task
    }));
    
    // عرض كل مهمة
    tasksArray.forEach((task, index) => {
        const taskItem = document.createElement('li');
        taskItem.className = 'task-item';
        taskItem.style.animationDelay = `${index * 0.1}s`;
        
        taskItem.innerHTML = `
            <h3>${task.title || 'بدون عنوان'}</h3>
            <p>${task.description || 'لا يوجد وصف'}</p>
            ${task.time ? `<p><strong>الوقت:</strong> ${task.time}</p>` : ''}
        `;
        
        tasksList.appendChild(taskItem);
    });
}

// العودة إلى شاشة اختيار اليوم
function showDaysSelection() {
    tasksView.classList.add('hidden');
    daysSelection.classList.remove('hidden');
}

// عرض/إخفاء مؤشر التحميل
function showLoading(show) {
    if (show) {
        loading.classList.remove('hidden');
    } else {
        loading.classList.add('hidden');
    }
}

// بدء التطبيق عند تحميل الصفحة
document.addEventListener('DOMContentLoaded', initApp);
