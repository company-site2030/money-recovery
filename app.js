import { auth, db } from "./firebase-config.js";
import { createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut, onAuthStateChanged } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-auth.js";
import { doc, setDoc, getDoc, updateDoc, collection, addDoc, onSnapshot } from "https://www.gstatic.com/firebasejs/10.12.2/firebase-firestore.js";

// تسجيل جديد
const registerForm = document.getElementById("registerForm");
if (registerForm) {
  registerForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const name = document.getElementById("fullName").value;
    const idNumber = document.getElementById("idNumber").value;
    const email = document.getElementById("email").value;
    const password = document.getElementById("password").value;

    try {
      const userCredential = await createUserWithEmailAndPassword(auth, email, password);
      await setDoc(doc(db, "users", userCredential.user.uid), {
        fullName: name,
        idNumber: idNumber,
        email: email,
        balance: 0
      });
      alert("تم التسجيل بنجاح");
      window.location.href = "dashboard.html";
    } catch (error) {
      alert(error.message);
    }
  });
}

// تسجيل الدخول
const loginForm = document.getElementById("loginForm");
if (loginForm) {
  loginForm.addEventListener("submit", async (e) => {
    e.preventDefault();
    const email = document.getElementById("loginEmail").value;
    const password = document.getElementById("loginPassword").value;

    try {
      await signInWithEmailAndPassword(auth, email, password);
      window.location.href = "dashboard.html";
    } catch (error) {
      alert("خطأ في تسجيل الدخول: " + error.message);
    }
  });
}

// الداشبورد
const userInfo = document.getElementById("userInfo");
if (userInfo) {
  onAuthStateChanged(auth, async (user) => {
    if (user) {
      const docRef = doc(db, "users", user.uid);
      const docSnap = await getDoc(docRef);

      if (docSnap.exists()) {
        const data = docSnap.data();
        userInfo.innerHTML = `<p>الاسم: ${data.fullName}<br>البريد: ${data.email}<br>الهوية: ${data.idNumber}</p>`;
        document.getElementById("balance").innerText = data.balance;
      }

      document.getElementById("logout").addEventListener("click", async () => {
        await signOut(auth);
        window.location.href = "login.html";
      });

      const withdrawBtn = document.getElementById("withdrawBtn");
      const withdrawForm = document.getElementById("withdrawForm");
      withdrawBtn.addEventListener("click", () => {
        withdrawForm.style.display = "block";
      });

      document.getElementById("confirmWithdraw").addEventListener("click", async () => {
        const amount = parseFloat(document.getElementById("amount").value);
        const docRef = doc(db, "users", user.uid);
        const docSnap = await getDoc(docRef);
        if (docSnap.exists()) {
          let currentBalance = docSnap.data().balance;
          if (amount <= currentBalance) {
            await updateDoc(docRef, { balance: currentBalance - amount });
            await addDoc(collection(db, "transactions", user.uid, "history"), {
              type: "withdraw",
              amount: amount,
              date: new Date().toISOString()
            });
            alert("تم إرسال طلب السحب");
            location.reload();
          } else {
            alert("الرصيد غير كافي");
          }
        }
      });

      const transactionsList = document.getElementById("transactionsList");
      onSnapshot(collection(db, "transactions", user.uid, "history"), (snapshot) => {
        transactionsList.innerHTML = "";
        snapshot.forEach((doc) => {
          const t = doc.data();
          const li = document.createElement("li");
          li.textContent = `${t.type} - ${t.amount} USD - ${t.date}`;
          transactionsList.appendChild(li);
        });
      });
    } else {
      window.location.href = "login.html";
    }
  });
}
