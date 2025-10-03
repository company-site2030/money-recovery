// Import Firebase modules
import { initializeApp } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-app.js";
import { getAnalytics } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-analytics.js";
import { getAuth, createUserWithEmailAndPassword, signInWithEmailAndPassword, signOut } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-auth.js";
import { getFirestore, doc, setDoc, getDoc, updateDoc, arrayUnion } from "https://www.gstatic.com/firebasejs/9.23.0/firebase-firestore.js";

const firebaseConfig = {
  apiKey: "AIzaSyC1ShbTDoztdOWWEnFbTPAgW4mhKpdLIK4",
  authDomain: "mussa2030-35f77.firebaseapp.com",
  projectId: "mussa2030-35f77",
  storageBucket: "mussa2030-35f77.appspot.com",
  messagingSenderId: "267072856781",
  appId: "1:267072856781:web:22d84c86fc9d7f83657f84",
  measurementId: "G-8ZR4Y9GN6G"
};

const app = initializeApp(firebaseConfig);
const analytics = getAnalytics(app);
const auth = getAuth();
const db = getFirestore(app);

/* ======= Register ======= */
const registerForm = document.getElementById('registerForm');
if(registerForm){
  registerForm.addEventListener('submit', async(e)=>{
    e.preventDefault();
    const fullName = document.getElementById('fullName').value;
    const idNumber = document.getElementById('idNumber').value;
    const email = document.getElementById('email').value;
    const phone = document.getElementById('phone').value;
    const password = document.getElementById('password').value;

    try{
      const userCredential = await createUserWithEmailAndPassword(auth,email,password);
      const user = userCredential.user;
      await setDoc(doc(db,"users",user.uid),{
        fullName,idNumber,email,phone,balance:0,transactions:[]
      });
      alert("تم التسجيل بنجاح!");
      window.location.href="login.html";
    }catch(error){ alert(error.message);}
  });
}

/* ======= Login ======= */
const loginForm = document.getElementById('loginForm');
if(loginForm){
  loginForm.addEventListener('submit',async(e)=>{
    e.preventDefault();
    const email = document.getElementById('loginEmail').value;
    const password = document.getElementById('loginPassword').value;
    try{
      const userCredential = await signInWithEmailAndPassword(auth,email,password);
      const user = userCredential.user;
      window.location.href="dashboard.html?uid="+user.uid;
    }catch(error){ alert(error.message);}
  });
}

/* ======= Dashboard ======= */
const urlParams = new URLSearchParams(window.location.search);
const uid = urlParams.get('uid');

const logoutBtn = document.getElementById('logout');
if(logoutBtn){
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
const withdrawBtn = document.getElementById('withdrawBtn');
const withdrawForm = document.getElementById('withdrawForm');
const confirmWithdraw = document.getElementById('confirmWithdraw');
const transactionsList = document.getElementById('transactionsList');

async function loadDashboard(){
  if(!uid) return;
  const userDoc = await getDoc(doc(db,"users",uid));
  if(userDoc.exists()){
    const data = userDoc.data();
    if(userInfoDiv){
      userInfoDiv.innerHTML=`
        <p><strong>الاسم الكامل:</strong> ${data.fullName}</p>
        <p><strong>رقم الهوية / الإقامة:</strong> ${data.idNumber}</p>
        <p><strong>البريد الإلكتروني:</strong> ${data.email}</p>
        <p><strong>رقم الهاتف:</strong> ${data.phone}</p>
      `;
    }
    if(balanceDiv) balanceDiv.textContent=`${data.balance} USD`;
    if(transactionsList){
      transactionsList.innerHTML='';
      if(data.transactions.length>0){
        data.transactions.forEach(tx=>{
          const li=document.createElement('li');
          li.textContent=`تم السحب: ${tx.amount} USD - البنك: ${tx.bankName} - الدولة: ${tx.country} - الآيبان: ${tx.iban} - التاريخ: ${tx.date}`;
          transactionsList.appendChild(li);
        });
      }else{
        transactionsList.innerHTML='<li>لا توجد عمليات بعد</li>';
      }
    }
  }
}

if(withdrawBtn){
  withdrawBtn.addEventListener('click',()=>{
    withdrawForm.style.display=withdrawForm.style.display==='none'?'block':'none';
  });
}

if(confirmWithdraw){
  confirmWithdraw.addEventListener('click',async()=>{
    const bankName=document.getElementById('bankName').value;
    const country=document.getElementById('country').value;
    const amount=parseFloat(document.getElementById('amount').value);
    const iban=document.getElementById('iban').value;
    if(!amount||!bankName||!country||!iban) return alert("املأ جميع الحقول");
    const userRef = doc(db,"users",uid);
    const userDoc = await getDoc(userRef);
    const userData = userDoc.data();
    if(amount>userData.balance) return alert("الرصيد غير كافٍ");
    const newBalance = userData.balance - amount;
    await updateDoc(userRef,{
      balance:newBalance,
      transactions: arrayUnion({bankName,country,amount,iban,date:new Date().toLocaleString()})
    });
    alert("تم السحب بنجاح!");
    loadDashboard();
    withdrawForm.style.display='none';
    document.getElementById('bankName').value='';
    document.getElementById('country').value='';
    document.getElementById('amount').value='';
    document.getElementById('iban').value='';
  });
}

loadDashboard();
