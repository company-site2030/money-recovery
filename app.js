import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import {
  getAuth,
  createUserWithEmailAndPassword,
  signInWithEmailAndPassword,
  signOut
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import {
  getFirestore,
  doc,
  setDoc,
  getDoc,
  updateDoc,
  arrayUnion
} from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

// إعدادات Firebase
const firebaseConfig = {
  apiKey: "AIzaSyC1ShbTDoztdOWWEnFbTPAgW4mhKpdLIK4",
  authDomain: "mussa2030-35f77.firebaseapp.com",
  projectId: "mussa2030-35f77",
  storageBucket: "mussa2030-35f77.appspot.com",
  messagingSenderId: "267072856781",
  appId: "1:267072856781:web:22d84c86fc9d7f83657f84",
  measurementId: "G-8ZR4Y9GN6G"
};

// تهيئة Firebase
const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore(app);

/* ========== التسجيل ========== */
const registerForm = document.getElementById('registerForm');
if (registerForm) {
  registerForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const idNumber = document.getElementById('idNumber').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;

      await setDoc(doc(db, "users", user.uid), {
        fullName,
        idNumber,
        email,
        phone,
        balance: 0,
        transactions: []
      });

      alert("تم التسجيل بنجاح!");
      window.location.href = "login.html";
    } catch (error) {
      alert(error.message);
    }
  });
}

/* ========== تسجيل الدخول ========== */
const loginForm = document.getElementById('loginForm');
if (loginForm) {
  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;

    try {
      const userCredential = await signInWithEmailAndPassword(auth, email, password);
      const user = userCredential.user;
      window.location.href = "dashboard.html?uid=" + user.uid;
    } catch (error) {
      alert(error.message);
    }
  });
}

/* ========== صفحة لوحة التحكم ========== */
const urlParams = new URLSearchParams(window.location.search);
const uid = urlParams.get('uid');

const logoutBtn = document.getElementById('logout');
if (logoutBtn) {
  logoutBtn.addEventListener('click', async () => {
    try {
      await signOut(auth);
      window.location.href = "index.html";
    } catch (error) {
      alert("حدث خطأ أثناء تسجيل الخروج: " + error.message);
    }
  });
}

const userInfoDiv = document.getElementById('userInfo');
const balanceDiv = document.getElementById('balance');
const transactionsList = document.getElementById('transactionsList');

async function loadDashboard() {
  if (!uid) return;

  try {
    const userDoc = await getDoc(doc(db, "users", uid));

    if (userDoc.exists()) {
      const data = userDoc.data();

      if (userInfoDiv) {
        document.getElementById('userName').innerHTML = `الاسم: <span>${data.fullName}</span>`;
        document.getElementById('userEmail').innerHTML = `الإيميل: <span>${data.email}</span>`;
        document.getElementById('userPhone').innerHTML = `رقم الهاتف: <span>${data.phone}</span>`;
      }

      if (balanceDiv) {
        balanceDiv.innerText = `${data.balance} ريال سعودي`;
      }

      if (transactionsList) {
        transactionsList.innerHTML = '';
        if (data.transactions.length > 0) {
          data.transactions.reverse().forEach(tx => {
            const li = document.createElement('li');
            li.textContent = `تم رفع الطلب : ${tx.amount} ريال سعودي - البنك: ${tx.bankName} - الحساب: ${tx.iban} - التاريخ: ${tx.date}`;
            transactionsList.appendChild(li);
          });
        } else {
          transactionsList.innerHTML = '<li>لا توجد عمليات بعد</li>';
        }
      }
    }
  } catch (error) {
    console.error("فشل تحميل البيانات:", error);
  }
}

// تحميل البيانات عند فتح الصفحة
loadDashboard();

/* ========== عملية السحب ========== */
const confirmWithdraw = document.getElementById('confirmWithdraw');
if (confirmWithdraw) {
  confirmWithdraw.addEventListener('click', async () => {
    const bankName = document.getElementById('bankName').value.trim();
    const amount = parseFloat(document.getElementById('amount').value.trim());
    const iban = document.getElementById('accountNumber').value.trim(); // ✅ تطابق مع HTML

    if (!bankName || !amount || !iban || amount <= 0) {
      alert("يرجى تعبئة جميع الحقول بشكل صحيح.");
      return;
    }

    try {
      const userRef = doc(db, "users", uid);
      const userDoc = await getDoc(userRef);
      const userData = userDoc.data();

      if (amount > userData.balance) {
        alert("الرصيد غير كافٍ للسحب");
        return;
      }

      const newBalance = userData.balance - amount;

      await updateDoc(userRef, {
        balance: newBalance,
        transactions: arrayUnion({
          bankName,
          amount,
          iban,
          date: new Date().toLocaleString()
        })
      });

      alert("تم تنفيذ طلب السحب بنجاح ✅");

      // تحديث الرصيد وسجل العمليات مباشرة
      loadDashboard();

      // إخفاء النافذة
      document.getElementById('popupOverlay').style.display = 'none';

      // تفريغ الحقول
      document.getElementById('bankName').value = '';
      document.getElementById('amount').value = '';
      document.getElementById('accountNumber').value = '';

    } catch (error) {
      console.error("خطأ أثناء السحب:", error);
      alert("حدث خطأ أثناء عملية السحب.");
    }
  });
}
