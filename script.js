// scripts.js - Main JavaScript file for PeerConnect Platform

// ==================== AUTHENTICATION FUNCTIONS ====================
function checkAuth() {
    // Check if user is logged in
    if (localStorage.getItem('isLoggedIn') !== 'true') {
        // Redirect to login page if not logged in
        window.location.href = 'login.html';
        return false;
    }
    return true;
}

function getCurrentUser() {
    // Get current user data from localStorage
    return JSON.parse(localStorage.getItem('currentUser') || '{}');
}

function logout() {
    // Clear authentication data
    localStorage.removeItem('isLoggedIn');
    localStorage.removeItem('currentUser');
    
    // Redirect to login page
    window.location.href = 'login.html';
}

// ==================== DASHBOARD FUNCTIONS ====================
function initializeDashboard() {
    if (!checkAuth()) return;
    
    const currentUser = getCurrentUser();
    
    // Update welcome message with user's name
    const welcomeElement = document.querySelector('.welcome-text h2 .highlight');
    if (welcomeElement && currentUser.firstName) {
        welcomeElement.textContent = currentUser.firstName;
    }
    
    // Load notifications, trending discussions, etc.
    loadDashboardData();
    
    // Set up event listeners
    setupDashboardEventListeners();
}

function loadDashboardData() {
    // In a real application, this would fetch data from a server
    console.log("Loading dashboard data...");
    
    // Sample data for demonstration
    const sampleNotifications = [
        { icon: 'fas fa-comment-dots', text: 'New reply to your post in Calculus discussion' },
        { icon: 'fas fa-book', text: 'New study material uploaded for Physics' },
        { icon: 'fas fa-user-plus', text: 'You have a new connection request' }
    ];
    
    const sampleTrending = [
        { icon: 'fas fa-comment', text: 'Calculus Exam Preparation Tips' },
        { icon: 'fas fa-comment', text: 'Web Development Project Ideas' },
        { icon: 'fas fa-comment', text: 'Physics Problem Solving Techniques' }
    ];
    
    const sampleResources = [
        { icon: 'fas fa-file-pdf', text: 'Calculus Cheat Sheet.pdf' },
        { icon: 'fas fa-file-video', text: 'Web Development Tutorial.mp4' },
        { icon: 'fas fa-file-alt', text: 'Physics Formula Collection.docx' }
    ];
    
    const sampleProgress = [
        { icon: 'fas fa-check-circle', text: 'Completed: 12 courses' },
        { icon: 'fas fa-clock', text: 'In progress: 3 courses' },
        { icon: 'fas fa-trophy', text: 'Achievements: 8 badges' }
    ];
    
    // Populate dashboard sections
    populateSection('notifications-card .notification-list', sampleNotifications);
    populateSection('.discussion-list', sampleTrending);
    populateSection('.resource-list', sampleResources);
    populateSection('.progress-metrics', sampleProgress);
}

function populateSection(selector, items) {
    const container = document.querySelector(selector);
    if (!container) return;
    
    container.innerHTML = '';
    items.forEach(item => {
        const element = document.createElement('div');
        element.className = 'notification-item';
        element.innerHTML = `<i class="${item.icon}"></i><span>${item.text}</span>`;
        container.appendChild(element);
    });
}

function setupDashboardEventListeners() {
    // Navigation
    const navBubbles = document.querySelectorAll('.nav-bubble');
    navBubbles.forEach(bubble => {
        bubble.addEventListener('click', function(e) {
            e.preventDefault();
            
            // Remove active class from all bubbles
            navBubbles.forEach(b => b.classList.remove('active'));
            
            // Add active class to clicked bubble
            this.classList.add('active');
            
            // Handle navigation based on data-target
            const target = this.getAttribute('data-target');
            handleNavigation(target);
        });
    });
    
    // Quick action buttons
    document.getElementById('upload-materials-btn')?.addEventListener('click', openStudyMaterialsModal);
    document.getElementById('request-help-btn')?.addEventListener('click', openEduConnectModal);
    
    // Logout button
    document.getElementById('logoutBtn')?.addEventListener('click', function(e) {
        e.preventDefault();
        logout();
    });
    
    // FAB button
    document.getElementById('fab-button')?.addEventListener('click', openStudyMaterialsModal);
}

function handleNavigation(target) {
    // In a real application, this would load different content based on the target
    console.log(`Navigating to: ${target}`);
    
    // For now, just show a message
    const message = `Would load ${target} content here`;
    alert(message);
}

// ==================== MODAL FUNCTIONS ====================
function openStudyMaterialsModal() {
    openModal('study-materials', 'Study Materials');
}

function openEduConnectModal() {
    openModal('educonnect', 'EduConnect - Social Learning Platform');
}

function openProfileModal() {
    openModal('profile', 'User Profile');
}

function openModal(type, title) {
    const modal = document.getElementById('page-modal');
    const modalTitle = document.getElementById('modal-title');
    const modalFrame = document.getElementById('modal-frame');
    
    if (!modal || !modalTitle || !modalFrame) return;
    
    // Set modal title
    modalTitle.textContent = title;
    
    // Set iframe source based on type
    let src = 'about:blank';
    switch(type) {
        case 'study-materials':
            src = 'study-materials.html';
            break;
        case 'educonnect':
            src = 'educonnect.html';
            break;
        case 'profile':
            src = 'profile.html';
            break;
    }
    modalFrame.src = src;
    
    // Show modal
    modal.style.display = 'flex';
}

function closeModal() {
    const modal = document.getElementById('page-modal');
    const modalFrame = document.getElementById('modal-frame');
    
    if (!modal || !modalFrame) return;
    
    // Hide modal and reset iframe
    modal.style.display = 'none';
    modalFrame.src = 'about:blank';
}

// ==================== STUDY MATERIALS FUNCTIONS ====================
function initializeStudyMaterials() {
    if (!checkAuth()) return;
    
    // Load study materials
    loadStudyMaterials();
    
    // Set up event listeners
    setupStudyMaterialsEventListeners();
}

function loadStudyMaterials() {
    // In a real application, this would fetch data from a server
    console.log("Loading study materials...");
    
    // Sample data for demonstration
    const studyMaterials = [
        {
            id: 1,
            title: "Calculus I Lecture Notes",
            module: "Mathematics",
            year: "2023",
            type: "Lecture Notes",
            description: "Complete lecture notes covering limits, derivatives, and applications of differentiation.",
            downloads: 245,
            likes: 32,
            date: "2023-10-15",
            rating: 4.8,
            uploader: {
                name: "Prof. James Wilson",
                avatar: "https://ui-avatars.com/api/?name=James+Wilson&background=3498db&color=fff"
            }
        },
        {
            id: 2,
            title: "Physics Midterm Past Papers",
            module: "Physics",
            year: "2022",
            type: "Past Papers",
            description: "Collection of past midterm papers from 2018-2022 with solutions.",
            downloads: 187,
            likes: 28,
            date: "2022-11-20",
            rating: 4.5,
            uploader: {
                name: "Dr. Sarah Johnson",
                avatar: "https://ui-avatars.com/api/?name=Sarah+Johnson&background=ff6b6b&color=fff"
            }
        }
    ];
    
    // Display materials
    displayMaterials(studyMaterials);
}

function displayMaterials(materials) {
    const materialsList = document.getElementById('materialsList');
    if (!materialsList) return;
    
    materialsList.innerHTML = '';
    
    if (materials.length === 0) {
        materialsList.innerHTML = `
            <div class="no-results" style="grid-column: 1 / -1; text-align: center; color: white;">
                <p>No study materials found matching your criteria.</p>
            </div>
        `;
        return;
    }
    
    materials.forEach(material => {
        const materialCard = document.createElement('div');
        materialCard.className = 'material-card glass-card';
        materialCard.innerHTML = `
            <div class="material-header">
                <span class="material-type">${material.type}</span>
                <span class="material-year">${material.year}</span>
            </div>
            <h3 class="material-title">${material.title}</h3>
            <div class="material-meta">
                <span>${material.module}</span>
                <span>★ ${material.rating}</span>
            </div>
            <div class="material-uploader">
                <img src="${material.uploader.avatar}" alt="${material.uploader.name}">
                <span>Uploaded by ${material.uploader.name}</span>
            </div>
            <p class="material-description">${material.description}</p>
            <div class="material-actions">
                <div class="material-stats">
                    <span><i class="fas fa-download"></i> ${material.downloads}</span>
                    <span><i class="fas fa-heart"></i> ${material.likes}</span>
                </div>
                <button class="download-btn" onclick="downloadMaterial(${material.id})">
                    <i class="fas fa-download"></i> Download
                </button>
            </div>
        `;
        materialsList.appendChild(materialCard);
    });
}

function filterMaterials() {
    const searchInput = document.getElementById('searchInput');
    const moduleFilter = document.getElementById('moduleFilter');
    const yearFilter = document.getElementById('yearFilter');
    const typeFilter = document.getElementById('typeFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (!searchInput || !moduleFilter || !yearFilter || !typeFilter || !sortFilter) return;
    
    const searchText = searchInput.value.toLowerCase();
    const moduleValue = moduleFilter.value;
    const yearValue = yearFilter.value;
    const typeValue = typeFilter.value;
    const sortValue = sortFilter.value;
    
    // In a real application, this would filter data from a server
    console.log(`Filtering with: search=${searchText}, module=${moduleValue}, year=${yearValue}, type=${typeValue}, sort=${sortValue}`);
    
    // For demonstration, just reload all materials
    loadStudyMaterials();
}

function resetFilters() {
    const searchInput = document.getElementById('searchInput');
    const moduleFilter = document.getElementById('moduleFilter');
    const yearFilter = document.getElementById('yearFilter');
    const typeFilter = document.getElementById('typeFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (searchInput) searchInput.value = '';
    if (moduleFilter) moduleFilter.value = '';
    if (yearFilter) yearFilter.value = '';
    if (typeFilter) typeFilter.value = '';
    if (sortFilter) sortFilter.value = 'recent';
    
    // Reload materials without filters
    loadStudyMaterials();
}

function downloadMaterial(id) {
    // In a real application, this would initiate a file download
    console.log(`Downloading material with ID: ${id}`);
    alert(`Downloading material with ID: ${id}`);
}

function setupStudyMaterialsEventListeners() {
    // Search input
    const searchInput = document.getElementById('searchInput');
    if (searchInput) {
        searchInput.addEventListener('keyup', filterMaterials);
    }
    
    // Filter dropdowns
    const moduleFilter = document.getElementById('moduleFilter');
    const yearFilter = document.getElementById('yearFilter');
    const typeFilter = document.getElementById('typeFilter');
    const sortFilter = document.getElementById('sortFilter');
    
    if (moduleFilter) moduleFilter.addEventListener('change', filterMaterials);
    if (yearFilter) yearFilter.addEventListener('change', filterMaterials);
    if (typeFilter) typeFilter.addEventListener('change', filterMaterials);
    if (sortFilter) sortFilter.addEventListener('change', filterMaterials);
    
    // Upload button
    const uploadBtn = document.getElementById('uploadBtn');
    if (uploadBtn) {
        uploadBtn.addEventListener('click', openUploadModal);
    }
    
    // Reset button
    const resetBtn = document.getElementById('resetBtn');
    if (resetBtn) {
        resetBtn.addEventListener('click', resetFilters);
    }
    
    // Upload form
    const uploadForm = document.getElementById('uploadForm');
    if (uploadForm) {
        uploadForm.addEventListener('submit', function(e) {
            e.preventDefault();
            uploadMaterial();
        });
    }
    
    // File input
    const fileInput = document.getElementById('fileInput');
    const fileName = document.getElementById('fileName');
    
    if (fileInput && fileName) {
        fileInput.addEventListener('change', function() {
            if (this.files.length > 0) {
                fileName.textContent = this.files[0].name;
            } else {
                fileName.textContent = '';
            }
        });
    }
}

function openUploadModal() {
    const uploadModal = document.getElementById('uploadModal');
    if (uploadModal) {
        uploadModal.style.display = 'flex';
    }
}

function closeUploadModal() {
    const uploadModal = document.getElementById('uploadModal');
    const uploadForm = document.getElementById('uploadForm');
    const fileName = document.getElementById('fileName');
    
    if (uploadModal) uploadModal.style.display = 'none';
    if (uploadForm) uploadForm.reset();
    if (fileName) fileName.textContent = '';
}

function uploadMaterial() {
    const materialTitle = document.getElementById('materialTitle');
    const materialModule = document.getElementById('materialModule');
    const materialYear = document.getElementById('materialYear');
    const materialType = document.getElementById('materialType');
    const materialDescription = document.getElementById('materialDescription');
    
    if (!materialTitle || !materialModule || !materialYear || !materialType || !materialDescription) return;
    
    // Validate form
    if (!materialTitle.value || !materialModule.value || !materialYear.value || !materialType.value) {
        alert('Please fill in all required fields');
        return;
    }
    
    // In a real application, this would upload to a server
    console.log('Uploading material:', {
        title: materialTitle.value,
        module: materialModule.value,
        year: materialYear.value,
        type: materialType.value,
        description: materialDescription.value
    });
    
    // Show success message and close modal
    alert('Material uploaded successfully!');
    closeUploadModal();
    
    // Reload materials to show the new upload
    loadStudyMaterials();
}

// ==================== PROFILE FUNCTIONS ====================
function initializeProfile() {
    if (!checkAuth()) return;
    
    // Load profile data
    loadProfileData();
    
    // Set up event listeners
    setupProfileEventListeners();
}

function loadProfileData() {
    const currentUser = getCurrentUser();
    
    // Populate form fields
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const studentNumber = document.getElementById('studentNumber');
    const studentEmail = document.getElementById('studentEmail');
    const yearOfStudy = document.getElementById('yearOfStudy');
    const registeredCourses = document.getElementById('registeredCourses');
    
    if (firstName && currentUser.firstName) firstName.value = currentUser.firstName;
    if (lastName && currentUser.lastName) lastName.value = currentUser.lastName;
    if (studentNumber && currentUser.studentNumber) studentNumber.textContent = currentUser.studentNumber;
    if (studentEmail && currentUser.email) studentEmail.textContent = currentUser.email;
    if (yearOfStudy && currentUser.yearOfStudy) yearOfStudy.value = currentUser.yearOfStudy;
    
    // Populate courses list
    if (registeredCourses && currentUser.courses) {
        registeredCourses.innerHTML = '';
        currentUser.courses.forEach(course => {
            const li = document.createElement('li');
            li.textContent = course;
            registeredCourses.appendChild(li);
        });
    }
}

function setupProfileEventListeners() {
    // Profile form
    const profileForm = document.getElementById('profileForm');
    if (profileForm) {
        profileForm.addEventListener('submit', function(e) {
            e.preventDefault();
            saveProfile();
        });
    }
    
    // Logout button
    const logoutBtn = document.getElementById('logoutBtn');
    if (logoutBtn) {
        logoutBtn.addEventListener('click', function(e) {
            e.preventDefault();
            logout();
        });
    }
}

function saveProfile() {
    const firstName = document.getElementById('firstName');
    const lastName = document.getElementById('lastName');
    const yearOfStudy = document.getElementById('yearOfStudy');
    
    if (!firstName || !lastName || !yearOfStudy) return;
    
    // Get current user
    const currentUser = getCurrentUser();
    
    // Update user data
    currentUser.firstName = firstName.value;
    currentUser.lastName = lastName.value;
    currentUser.yearOfStudy = yearOfStudy.value;
    
    // Save back to localStorage
    localStorage.setItem('currentUser', JSON.stringify(currentUser));
    
    // Show success message
    alert('Profile updated successfully!');
}

// ==================== EDUCONNECT FUNCTIONS ====================
function initializeEduConnect() {
    if (!checkAuth()) return;
    
    // Load posts and other data
    loadPosts();
    
    // Set up event listeners
    setupEduConnectEventListeners();
}

function loadPosts() {
    // In a real application, this would fetch posts from a server
    console.log("Loading posts...");
    
    // Sample data for demonstration
    const posts = [
        {
            id: 1,
            user: {
                name: "Professor Smith",
                avatar: "https://ui-avatars.com/api/?name=Professor+Smith&background=4267B2&color=fff"
            },
            content: "Reminder: Calculus I exam next Monday. Don't forget to review chapters 3-5 and practice problems. Office hours will be extended on Friday for any questions!",
            timestamp: "2 hrs ago",
            likes: 120,
            comments: 25,
            course: "Mathematics 101"
        },
        {
            id: 2,
            user: {
                name: "Jane Doe",
                avatar: "https://ui-avatars.com/api/?name=Jane+Doe&background=45bd62&color=fff"
            },
            content: "Just finished my web development project! Check out this cool responsive layout I created using CSS Grid and Flexbox.",
            image: "https://via.placeholder.com/600x300?text=Web+Development+Project",
            timestamp: "5 hrs ago",
            likes: 85,
            comments: 18,
            course: "Web Development"
        }
    ];
    
    // Display posts
    displayPosts(posts);
}

function displayPosts(posts) {
    const postsContainer = document.getElementById('postsContainer');
    if (!postsContainer) return;
    
    postsContainer.innerHTML = '';
    
    posts.forEach(post => {
        const postElement = document.createElement('div');
        postElement.className = 'post glass-card';
        postElement.innerHTML = `
            <div class="post-header">
                <img src="${post.user.avatar}" alt="${post.user.name}" class="profile-clickable">
                <div class="post-user-info">
                    <h4 class="profile-clickable">${post.user.name}</h4>
                    <span>${post.course} · ${post.timestamp}</span>
                </div>
            </div>
            <div class="post-content">
                <p>${post.content}</p>
                ${post.image ? `<img src="${post.image}" alt="Post image">` : ''}
                <div style="color: #4267B2; font-weight: 500; margin-top: 10px;">
                    <i class="fas fa-graduation-cap"></i> ${post.course}
                </div>
            </div>
            <div class="post-stats">
                <div class="likes">${post.likes} likes</div>
                <div class="comments">${post.comments} comments</div>
            </div>
            <div class="post-buttons">
                <div class="post-button like-btn">
                    <i class="far fa-thumbs-up"></i>
                    <span>Like</span>
                </div>
                <div class="post-button comment-btn">
                    <i class="far fa-comment"></i>
                    <span>Comment</span>
                </div>
                <div class="post-button">
                    <i class="far fa-share-square"></i>
                    <span>Share</span>
                </div>
            </div>
        `;
        postsContainer.appendChild(postElement);
    });
}

function setupEduConnectEventListeners() {
    // Create post input
    const createPostInput = document.getElementById('create-post-input');
    if (createPostInput) {
        createPostInput.addEventListener('keypress', function(e) {
            if (e.key === 'Enter' && this.value.trim() !== '') {
                createPost(this.value);
                this.value = '';
            }
        });
    }
    
    // Like buttons
    const likeButtons = document.querySelectorAll('.like-btn');
    likeButtons.forEach(button => {
        button.addEventListener('click', function() {
            const icon = this.querySelector('i');
            if (icon.classList.contains('far')) {
                icon.classList.remove('far');
                icon.classList.add('fas');
                this.style.color = '#1877f2';
            } else {
                icon.classList.remove('fas');
                icon.classList.add('far');
                this.style.color = '';
            }
        });
    });
    
    // Comment buttons
    const commentButtons = document.querySelectorAll('.comment-btn');
    commentButtons.forEach(button => {
        button.addEventListener('click', function() {
            const commentsSection = this.closest('.post').querySelector('.comments-section');
            if (commentsSection) {
                commentsSection.style.display = commentsSection.style.display === 'none' ? 'block' : 'none';
            }
        });
    });
    
    // Profile clickables
    const profileClickables = document.querySelectorAll('.profile-clickable');
    profileClickables.forEach(element => {
        element.addEventListener('click', function() {
            const userName = this.closest('.post-header').querySelector('h4').textContent;
            openMessageModal(userName);
        });
    });
}

function createPost(content) {
    // In a real application, this would send the post to a server
    console.log("Creating post:", content);
    
    // For demonstration, just show a message
    alert(`Post created: ${content}`);
    
    // Reload posts to show the new post
    loadPosts();
}

function openMessageModal(userName) {
    // In a real application, this would open a message modal
    console.log(`Opening message modal for: ${userName}`);
    alert(`Would open message modal for ${userName}`);
}

// ==================== INITIALIZATION ====================
document.addEventListener('DOMContentLoaded', function() {
    // Initialize based on current page
    const bodyClass = document.body.className || '';
    const pathname = window.location.pathname;
    
    if (pathname.includes('dashboard.html') || pathname.endsWith('/')) {
        initializeDashboard();
    } else if (pathname.includes('study-materials.html')) {
        initializeStudyMaterials();
    } else if (pathname.includes('profile.html')) {
        initializeProfile();
    } else if (pathname.includes('educonnect.html')) {
        initializeEduConnect();
    }
    
    // Close modal when clicking outside
    window.addEventListener('click', function(e) {
        const modal = document.getElementById('page-modal');
        if (e.target === modal) {
            closeModal();
        }
        
        const uploadModal = document.getElementById('uploadModal');
        if (e.target === uploadModal) {
            closeUploadModal();
        }
    });
    
    // Close modal with escape key
    document.addEventListener('keydown', function(e) {
        if (e.key === 'Escape') {
            closeModal();
            closeUploadModal();
        }
    });
});

// Make functions available globally for HTML onclick attributes
window.openStudyMaterialsModal = openStudyMaterialsModal;
window.openEduConnectModal = openEduConnectModal;
window.openProfileModal = openProfileModal;
window.closeModal = closeModal;
window.closeUploadModal = closeUploadModal;
window.downloadMaterial = downloadMaterial;
window.filterMaterials = filterMaterials;
window.resetFilters = resetFilters;
window.logout = logout;