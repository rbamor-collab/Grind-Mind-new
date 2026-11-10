document.addEventListener('DOMContentLoaded', function() {

  // --- 1. GUEST SESSION CREATION ---
  const btnExplore = document.querySelector('.btn-explore');
  if (btnExplore) {
    btnExplore.addEventListener('click', function(e) {
      if (!localStorage.getItem('currentUser')) {
        const guestUser = {
          name: 'Guest',
          isGuest: true,
          completedModules: [],
          completedLessons: []
        };
        localStorage.setItem('currentUser', JSON.stringify(guestUser));
      }
    });
  }

  // --- 2. DYNAMIC NAVBAR (LOG IN / SIGN UP PARA SA GUEST) ---
  const navButtons = document.getElementById('navButtons');
  const currentUserJSON = localStorage.getItem('currentUser');
  let currentUser = currentUserJSON ? JSON.parse(currentUserJSON) : null;

  if (navButtons) {
    if (!currentUser || currentUser.isGuest) {
      navButtons.innerHTML = `
        <a href="login.html" class="btn-logout" style="margin-right: 10px;">Log In</a>
        <a href="signup.html" class="btn-signup">Sign Up</a>
      `;
    } else {
      navButtons.innerHTML = `
        <a href="my-account.html" class="btn-logout" style="margin-right: 10px;">My Profile</a>
        <button id="btnLogout" class="btn-logout">Logout</button>
      `;
    }
  }

  // --- 3. ENGAGING "CONTINUE LEARNING" BANNER SA DASHBOARD ---
  const continueBanner = document.getElementById('continueBanner');
  if (continueBanner && currentUser && !currentUser.isGuest) {
    const completed = currentUser.completedModules || [];
    let lastCourse = 'Microsoft Word';
    let targetLink = 'word-course.html';

    if (completed.some(m => m.includes('excel'))) {
      lastCourse = 'Microsoft Excel';
      targetLink = 'excel-course.html';
    } else if (completed.some(m => m.includes('powerpoint') || m.includes('ppt'))) {
      lastCourse = 'Microsoft PowerPoint';
      targetLink = 'powerpoint-course.html';
    }

    continueBanner.innerHTML = `
      <div class="continue-banner">
        <div>
          <h3>👋 Welcome back, ${currentUser.name}!</h3>
          <p>Ready to jump back into <strong>${lastCourse}</strong> and continue building your skills?</p>
        </div>
        <a href="${targetLink}" class="btn-continue">Continue Course &rarr;</a>
      </div>
    `;
  }

  // --- 4. SIGN UP FUNCTION ---
  const signupForm = document.getElementById('signupForm');
  if (signupForm) {
    signupForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const name = document.getElementById('signupName').value.trim();
      const email = document.getElementById('signupEmail').value.trim();
      const password = document.getElementById('signupPassword').value.trim();

      if (!name || !email || !password) {
        alert('Mangyaring punan ang lahat ng fields.');
        return;
      }

      let users = JSON.parse(localStorage.getItem('users')) || [];
      const existingUserIndex = users.findIndex(u => u.email.toLowerCase() === email.toLowerCase());

      const studentId = 'GM-2026-' + Math.floor(1000 + Math.random() * 9000);
      const joinedDate = 'October 2026';

      let finalStudentId = (existingUserIndex >= 0 && users[existingUserIndex].studentId)
        ? users[existingUserIndex].studentId
        : studentId;

      const newUser = {
        name: name,
        email: email,
        password: password,
        studentId: finalStudentId,
        joinedDate: joinedDate,
        isGuest: false,
        profilePic: existingUserIndex >= 0 ? (users[existingUserIndex].profilePic || '') : '',
        completedModules: existingUserIndex >= 0 ? (users[existingUserIndex].completedModules || []) : [],
        completedLessons: existingUserIndex >= 0 ? (users[existingUserIndex].completedLessons || []) : []
      };

      if (existingUserIndex >= 0) {
        users[existingUserIndex] = newUser;
      } else {
        users.push(newUser);
      }

      localStorage.setItem('users', JSON.stringify(users));
      localStorage.setItem('currentUser', JSON.stringify(newUser));
      alert('Account created successfully! Welcome ' + name);
      window.location.href = 'my-account.html';
    });
  }

  // --- 5. LOG IN FUNCTION ---
  const loginForm = document.getElementById('loginForm');
  if (loginForm) {
    loginForm.addEventListener('submit', function(e) {
      e.preventDefault();
      const inputEmail = document.getElementById('loginEmail').value.trim().toLowerCase();
      const inputPassword = document.getElementById('loginPassword').value.trim();

      let users = JSON.parse(localStorage.getItem('users')) || [];

      if (users.length === 0) {
        alert('Wala pang nakarehistrong account. Mag-Sign Up muna.');
        window.location.href = 'signup.html';
        return;
      }

      const matchedUser = users.find(u => u.email.toLowerCase() === inputEmail && u.password === inputPassword);

      if (matchedUser) {
        matchedUser.isGuest = false;
        localStorage.setItem('currentUser', JSON.stringify(matchedUser));
        alert('Login Successful! Welcome back, ' + matchedUser.name + '!');
        window.location.href = 'my-account.html';
      } else {
        alert('Mali ang email o password. Subukan muli.');
      }
    });
  }

  // --- 6. RENDER USER DATA & PROFILE PICTURE SA PROFILE PAGE ---
  if (window.location.pathname.includes('my-account.html')) {
    if (!currentUser || currentUser.isGuest) {
      alert('Kailangan mong mag-Log In bago mabuksan ang Profile Page.');
      window.location.href = 'login.html';
    } else {
      if (!currentUser.studentId) {
        currentUser.studentId = 'GM-2026-' + Math.floor(1000 + Math.random() * 9000);
      }
      if (!currentUser.joinedDate) {
        currentUser.joinedDate = 'October 2026';
      }

      localStorage.setItem('currentUser', JSON.stringify(currentUser));
      let users = JSON.parse(localStorage.getItem('users')) || [];
      let userIndex = users.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
      if (userIndex !== -1) {
        users[userIndex].studentId = currentUser.studentId;
        users[userIndex].joinedDate = currentUser.joinedDate;
        localStorage.setItem('users', JSON.stringify(users));
      }

      const profileName = document.getElementById('profileName');
      const profileEmail = document.getElementById('profileEmail');
      const profileStudentId = document.getElementById('profileStudentId');
      const profileJoinedDate = document.getElementById('profileJoinedDate');
      const profileImage = document.getElementById('profileImage');
      const imageInput = document.getElementById('imageInput');

      if (profileName) profileName.textContent = currentUser.name;
      if (profileEmail) profileEmail.textContent = currentUser.email;
      if (profileStudentId) profileStudentId.textContent = currentUser.studentId;
      if (profileJoinedDate) profileJoinedDate.textContent = currentUser.joinedDate;

      // Load Profile Image kung may na-save na
      if (currentUser.profilePic && profileImage) {
        profileImage.src = currentUser.profilePic;
      }

      // Handle Image Upload
      if (imageInput) {
        imageInput.addEventListener('change', function(e) {
          const file = e.target.files[0];
          if (file) {
            if (file.size > 2 * 1024 * 1024) {
              alert('Masyadong malaki ang file. Pumili ng larawan na mas mababa sa 2MB.');
              return;
            }

            const reader = new FileReader();
            reader.onload = function(event) {
              const base64Image = event.target.result;

              if (profileImage) profileImage.src = base64Image;

              currentUser.profilePic = base64Image;
              localStorage.setItem('currentUser', JSON.stringify(currentUser));

              let usersList = JSON.parse(localStorage.getItem('users')) || [];
              let idx = usersList.findIndex(u => u.email.toLowerCase() === currentUser.email.toLowerCase());
              if (idx !== -1) {
                usersList[idx].profilePic = base64Image;
                localStorage.setItem('users', JSON.stringify(usersList));
              }

              alert('🎉 Matagumpay na naisaayos ang iyong Profile Picture!');
            };

            reader.readAsDataURL(file);
          }
        });
      }

      // Calculate Course Progress
      const completed = currentUser.completedModules || [];
      const wordCount = completed.filter(m => m.toLowerCase().includes('word')).length;
      const excelCount = completed.filter(m => m.toLowerCase().includes('excel')).length;
      const pptCount = completed.filter(m => m.toLowerCase().includes('powerpoint') || m.toLowerCase().includes('ppt')).length;

      // Update Word Progress
      const wordText = document.getElementById('wordProgressText');
      const wordBar = document.getElementById('wordProgressBar');
      if (wordText && wordBar) {
        wordText.textContent = `${wordCount} / 3 Modules`;
        setTimeout(() => { wordBar.style.width = `${(wordCount / 3) * 100}%`; }, 100);
      }

      // Update Excel Progress
      const excelText = document.getElementById('excelProgressText');
      const excelBar = document.getElementById('excelProgressBar');
      if (excelText && excelBar) {
        excelText.textContent = `${excelCount} / 3 Modules`;
        setTimeout(() => { excelBar.style.width = `${(excelCount / 3) * 100}%`; }, 100);
      }

      // Update PPT Progress
      const pptText = document.getElementById('pptProgressText');
      const pptBar = document.getElementById('pptProgressBar');
      if (pptText && pptBar) {
        pptText.textContent = `${pptCount} / 3 Modules`;
        setTimeout(() => { pptBar.style.width = `${(pptCount / 3) * 100}%`; }, 100);
      }
    }
  }

  // --- 7. UNLOCK LESSON 1.2 LOGIC FOR WORD COURSE ---
  if (window.location.pathname.includes('word-course.html')) {
    const btnCompleteLesson1 = document.getElementById('btnCompleteLesson1');
    const nextLessonBox = document.getElementById('nextLessonBox');
    const btnGoToLesson2 = document.getElementById('btnGoToLesson2');
    const lesson1_2_item = document.getElementById('lesson1_2_item');
    const lesson1_2_badge = document.getElementById('lesson1_2_badge');

    let activeUser = JSON.parse(localStorage.getItem('currentUser')) || {};
    activeUser.completedLessons = activeUser.completedLessons || [];

    function unlockLesson1_2() {
      if (nextLessonBox) nextLessonBox.style.display = 'block';

      if (lesson1_2_item && lesson1_2_badge) {
        lesson1_2_item.style.opacity = '1';
        lesson1_2_badge.textContent = 'UNLOCKED 🔓';
        lesson1_2_badge.style.background = '#dcfce7';
        lesson1_2_badge.style.color = '#15803d';
      }

      if (btnCompleteLesson1) {
        btnCompleteLesson1.textContent = '✅ Lesson 1.1 Completed';
        btnCompleteLesson1.style.backgroundColor = '#16a34a';
        btnCompleteLesson1.disabled = true;
      }
    }

    if (activeUser.completedLessons.includes('word-1.1')) {
      unlockLesson1_2();
    }

    if (btnCompleteLesson1) {
      btnCompleteLesson1.addEventListener('click', function() {
        if (!activeUser.completedLessons.includes('word-1.1')) {
          activeUser.completedLessons.push('word-1.1');
          localStorage.setItem('currentUser', JSON.stringify(activeUser));

          let users = JSON.parse(localStorage.getItem('users')) || [];
          let index = users.findIndex(u => u.email === activeUser.email);
          if (index !== -1) {
            users[index] = activeUser;
            localStorage.setItem('users', JSON.stringify(users));
          }
        }
        unlockLesson1_2();
      });
    }

    if (btnGoToLesson2) {
      btnGoToLesson2.addEventListener('click', function() {
        if (lesson1_2_item) {
          lesson1_2_item.scrollIntoView({ behavior: 'smooth' });
        }
      });
    }
  }

  // --- 8. LOG OUT FUNCTION ---
  document.addEventListener('click', function(e) {
    if (e.target && e.target.id === 'btnLogout') {
      e.preventDefault();
      localStorage.removeItem('currentUser');
      alert('Logged out successfully.');
      window.location.href = 'login.html';
    }
  });

});

function markLesson1_1Complete() {
            localStorage.setItem('powerpoint_lesson1_1_completed', 'true');
            alert('Natapos mo na ang Lesson 1.1!');
            checkProgress();
        }