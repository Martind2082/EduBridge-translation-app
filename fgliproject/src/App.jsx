import { useEffect, useRef, useState } from 'react'
import './App.css'
import axios from 'axios';
import {GoogleButton} from 'react-google-button'
import { auth, db } from './firebase'
import {GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut} from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';

function App() {
  const [User, setUser] = useState('');
  const [Leader, setLeader] = useState('');
  const [Opponent, setOpponent] = useState('');
  const data = useRef();
  const link = useRef();
  const creatorgameroomref = useRef();
  const activegamesref = useRef();
  const joinergameroomref = useRef();
  const gameroomref = useRef();
  const gameroomquestionsref = useRef();
  const gameroomcastleref = useRef();
  const opponentnameref = useRef();
  const playerhealthref = useRef();
  const opponenthealthref = useRef();
  let quizletdata;

  function signinwithgoogle() {
    const provider = new GoogleAuthProvider();
    signInWithPopup(auth, provider);
  }
    //sets user state if user is signedin
    useEffect(() => {
      const unsub = onAuthStateChanged(auth, user => {
        setUser(user);
      })
      return unsub;
    })



    function signout() {
      signOut(auth);
    }

  function submit() {
    let loadingscreen = document.createElement('img');
    loadingscreen.src = "https://s1.aigei.com/src/img/gif/8f/8f911964f5824fe393694a665b1b4d6a.gif?e=1735488000&token=P7S2Xpzfz11vAkASLTkfHN7Fw-oOZBecqeJaxypL:S58WVBQ-Zs8CIrNVK4bTz6ykgzk=";
    data.current.append(loadingscreen);
    const options = {
      method: 'GET',
      url: "http://localhost:8000/results",
      params: {link: link.current.value}
    }
    axios.request(options)
      .catch(err => console.log(err))
      .then(response => {
        data.current.textContent = "";
        console.log(response);
        quizletdata = response.data.quizletinfo;
        setDoc(doc(db, User.email, "data"), {
          data: quizletdata
        })
        //displays the flashcards on screen term and definition side by side
        for (let i = 0; i < quizletdata.length; i+=2) {
          let maindiv = document.createElement("div");
          let div1 = document.createElement("div");
          let div2 = document.createElement("div");

          maindiv.style = 'display: flex; width: 50%; justify-content: space-evenly; border: 1px solid black; padding-top: 1rem; padding-bottom: 1rem;';
          div1.textContent = response.data.quizletinfo[i];
          div2.textContent = response.data.quizletinfo[i + 1];

          maindiv.append(div1);
          maindiv.append(div2);

          data.current.append(maindiv);
        }
      })
  }
  //see available games
  function seegames() {
    activegamesref.current.style = "display: block";
    onSnapshot(collection(db, "games"), (snapshot) => {
      snapshot.docs.forEach(game => {
        let main = document.createElement('div');
        main.style = "display: flex; height: 4rem; justify-content: space-between; align-items: center; padding-left: 0.5rem; padding-right: 0.5rem";

        let title = document.createElement('div');
        title.textContent = `${game.data().name}'s game`;

        let img = document.createElement('img');
        img.style = "border-radius: 50%; width: 4rem;";
        img.src = game.data().pfp;

        let button = document.createElement('button');
        button.style = "background: #61eb34; color: white; font-weight: bold; border-radius: 15px; padding-left: 1rem; padding-right: 1rem; padding-top: 0.5rem; padding-bottom: 0.5rem";
        if (game.data().status == "open") {
          button.textContent = "Join Game";
        } else {
          button.textContent = "Game full";
        }

        //after user hits join game
        button.onclick = () => {
          setDoc(doc(db, `game ${game.data().email}`, game.data().email), {
            health: 150,
            name: game.data().name,
            pfp: game.data().pfp,
            active: "false",
            email: game.data().email,
            open: "true"
          })
          setDoc(doc(db, `game ${game.data().email}`, User.email), {
            health: 150,
            name: User.displayName,
            pfp: User.photoURL,
            active: "false",
            email: User.email,
            open: "true"
          })

          setLeader(game.data().email);
          setOpponent(game.data().email);

          joinergameroomref.current.style = "display: block";

          onSnapshot(collection(db, `game ${game.data().email}`), (snapshot) => {
            snapshot.docs.forEach(person => {
              let persondiv = document.createElement('div');
              persondiv.textContent = person.data().name;
              joinergameroomref.current.append(persondiv);
            })

            for (let i = 1; i < joinergameroomref.current.children.length - 2; i++) {
              joinergameroomref.current.children[i].remove();
            }
          })

        }

        main.append(img);
        main.append(title);
        main.append(button);
        activegamesref.current.append(main);
      })
    })
  }

  //puts User onto the game list and opens the game room lobby for the game creator
  function creategame() {
    setDoc(doc(db, "games", User.email), {
      pfp: User.photoURL,
      email: User.email,
      name: User.displayName,
      status: "open"
    })

    setLeader(User.email);

    creatorgameroomref.current.style = "display: block";
    let div = document.createElement('div');
    div.textContent = User.displayName;
    creatorgameroomref.current.append(div);
    
    onSnapshot(collection(db, `game ${User.email}`), (snapshot) => {
      if (snapshot.docs.length !== 0) {
        creatorgameroomref.current.children[0].remove();

        snapshot.docs.forEach(person => {
          let persondiv = document.createElement('div');
          persondiv.textContent = person.data().name;
          persondiv.classList.add(person.data().email);
          creatorgameroomref.current.append(persondiv);
        })

        for (let i = 0; i < creatorgameroomref.current.children.length; i++) {
          if (creatorgameroomref.current.children[i].classList[0] !== User.email) {
            setOpponent(creatorgameroomref.current.children[i].classList[0]);
          }
        }

        for (let i = 0; i < creatorgameroomref.current.children.length - 2; i++) {
          creatorgameroomref.current.children[i].remove();
        }
        
        //after someone joins the creator's room, the button to start the game will appear
        setTimeout(() => {
          if (creatorgameroomref.current.children[creatorgameroomref.current.children.length - 1].textContent == "Start Game") {
            creatorgameroomref.current.children[creatorgameroomref.current.children.length - 1].remove();
          }
          let button = document.createElement('button');
          button.style = "color: white; font-weight: bold; background: lightgreen; padding: 0.3rem; border-radius: 15px";
          button.textContent = "Start Game";
          creatorgameroomref.current.append(button);
          button.onclick = () => {
            onSnapshot(collection(db, `game ${User.email}`), (snapshot) => {
              snapshot.docs.forEach(person => {
                updateDoc(doc(db, `game ${User.email}`, person.data().email), {
                  active: "true"
                })
              })
            })
          }

          let endgame = document.createElement('button');
          endgame.style = "color: white; font-weight: bold; background: #de351b; padding: 0.3rem; border-radius: 15px";
          endgame.textContent = "End Game";
          creatorgameroomref.current.append(endgame);
          endgame.onclick = () => {
            deleteDoc(doc(db, "games", User.email))
            onSnapshot(collection(db, `game ${User.email}`), (snapshot) => {
              snapshot.docs.forEach(person => {
                updateDoc(doc(db, `game ${User.email}`, person.data().email), {
                  open: "false"
                })
              })
            })
            creatorgameroomref.current.textContent = "";
            creatorgameroomref.current.style = "display: none";
            setTimeout(() => {
              onSnapshot(collection(db, `game ${User.email}`), (snapshot) => {
                snapshot.docs.forEach(person => {
                  deleteDoc(doc(db, `game ${User.email}`, person.data().email))
                })
              })
            }, 2000);
          }
        }, 1000);

      }
    })
  }

  useEffect(() => {
    if (Leader != "") {
      onSnapshot(collection(db, `game ${Leader}`), (snapshot) => {
        if (snapshot.docs[0].data().open == "false") {
          joinergameroomref.current.textContent = "";
          joinergameroomref.current.style = "display: none";
        }

        if (snapshot.docs[0].data().active == "true") {
          gameroomref.current.style = "display: block";
          document.querySelectorAll('.lobby')[0].style.display = "none";
          document.querySelectorAll('.lobby')[1].style.display = "none";

          getDoc(doc(db, `game ${Leader}`, Opponent)).then(data => {
            if (data.data().health == 0) {
              gameroomref.current.style = "display: none";
              if (Leader == User.email) {
                creategame();
              } else {
                document.querySelectorAll('.lobby')[1].style.display = "block";
              }
            }
            opponentnameref.current.textContent = data.data().name;
            opponenthealthref.current.textContent = data.data().health;
          })
          getDoc(doc(db, `game ${Leader}`, User.email)).then(data => {
            if (data.data().health == 0) {
              gameroomref.current.style = "display: none";
              if (Leader == User.email) {
                creategame();
              } else {
                document.querySelectorAll('.lobby')[1].style.display = "block";
              }
            }
            playerhealthref.current.textContent = data.data().health;
              setTimeout(() => {
                if (document.body.children[document.body.children.length - 1].classList[0] !== "arrow") {
                  let arrow = document.createElement('img');
                  arrow.src = "../images/arrowleft.png";
                  arrow.classList.add('arrowatyou');
                  document.body.append(arrow);
                  setTimeout(() => {
                    arrow.remove();
                  }, 1000);
                }
              }, 300);
          })

          getDoc(doc(db, Leader, "data")).then((data) => {

            let oddIndexes = data.data().data.map((_, index) => index).filter(index => index % 2 !== 0);
            setTimeout(() => {              
              for (let i = oddIndexes.length - 1; i > 0; i--) {
                const j = Math.floor(Math.random() * (i + 1));
                [oddIndexes[i], oddIndexes[j]] = [oddIndexes[j], oddIndexes[i]];
              }
              //array of picked indexes
              let arr = oddIndexes.slice(0, 4);

              //random num determines correct answer
              let randomnum = Math.floor(Math.random() * 4);

              let main = document.createElement('div');
              main.style = "width: 100%;";

              let term = document.createElement("div");
              term.textContent = data.data().data[arr[randomnum]-1];
              term.style = "width: 100%; height: 10rem; font-size: 4rem; text-align: center";

              let answerrow1 = document.createElement('div');
              answerrow1.style = "display: flex; justify-content: space-evenly; height: 4rem; font-size: 2rem;";
              let answer1 = document.createElement('button');
              let answer2 = document.createElement('button');

              answer1.textContent = data.data().data[arr[0]];
              answer2.textContent = data.data().data[arr[1]];
              answer1.classList.add('answeroption');
              answer2.classList.add('answeroption');
              gameroomquestionsref.current.textContent = "";
              answerrow1.append(answer1);
              answerrow1.append(answer2);

              let answerrow2 = document.createElement('div');
              answerrow2.style = "display: flex; justify-content: space-evenly; height: 4rem; font-size: 2rem;";
              let answer3 = document.createElement('button');
              let answer4 = document.createElement('button');

              answer3.textContent = data.data().data[arr[2]];
              answer4.textContent = data.data().data[arr[3]];
              answer3.classList.add('answeroption');
              answer4.classList.add('answeroption');
              answerrow2.append(answer3);
              answerrow2.append(answer4);

              main.append(term);
              main.append(answerrow1);
              main.append(answerrow2);
              gameroomquestionsref.current.append(main);

              document.querySelectorAll('.answeroption').forEach(button => {
                button.onclick = () => {
                  if (button.textContent == data.data().data[arr[randomnum]]) {
                    console.log('CORRECT');

                    let arrow = document.createElement('img');
                    arrow.classList.add('arrow');
                    arrow.src = "../images/arrow.png";
                    document.body.append(arrow);
                    setTimeout(() => {
                      arrow.remove();
                    }, 1000);

                    getDoc(doc(db, `game ${Leader}`, Opponent)).then(data => {
                      let health = data.data().health;
                      let newhealth = health - 50;
                      updateDoc(doc(db, `game ${Leader}`, Opponent), {
                        health: newhealth
                      })
                    })
                  } else {
                    console.log('WRONG');
                  }
                }
              })
            }, 800);
          })
        }
      })
    }
  }, [Leader])



  return (
    <div>
      {
        !User ? <div>
          <p>Please sign in</p>
          <GoogleButton onClick={signinwithgoogle}/>
        </div> :
        <div>
          {/* this div will show when the game starts */}
          <div className='hidden absolute w-full h-[99vh] bg-gray-400' ref={gameroomref}>
            <div ref={gameroomquestionsref}></div>
            <div ref={gameroomcastleref}>
              <div className='flex w-full justify-evenly'>
                <img className='w-[15rem] h-[15rem]' src="../images/castle.png"/>
                <img className='w-[15rem] h-[15rem]' src="../images/castle.png"/>
              </div>
              <div className='flex w-full justify-evenly h-[5rem]'>
                <div className='w-[10rem] font-bold text-yellow-500 text-center'>You</div>
                <div className='w-[10rem] font-bold text-center' ref={opponentnameref}></div>
              </div>
              <div className='w-full flex justify-evenly'>
                <div ref={playerhealthref}></div>
                <div ref={opponenthealthref}></div>
              </div>
            </div>
          </div>
          <div className='flex justify-between w-full h-8 items-center mb-4'>
            <div className='ml-4 flex items-center'>
              <img className='rounded-[50%] w-8' src={User.photoURL}/>
              <p className='ml-4'>Welcome {User.displayName}</p>
            </div>
            <button onClick={signout} className='bg-gray-400 py-1 px-2.5 rounded-[12px] mr-4'>Sign out</button>
          </div>
          <div>
            <input className='border-black border border-solid w-[70%]' ref={link} placeholder='link'/>
            <button className='bg-green-400 p-1 rounded-lg ml-4' onClick={submit}>Enter</button>
          </div>
          <div className='border-2 border-black my-8 flex flex-col items-center h-[20rem] overflow-auto' ref={data}></div>

          <button onClick={creategame} className='bg-green-400 px-4 py-2 font-bold text-white rounded-[15px]'>Create Game</button>
          <p>or</p>
          <button onClick={seegames} className='bg-green-400 px-4 py-2 font-bold text-white rounded-[15px]'>Join a Game</button>
          
          {/* menu that shows all avaiable games */}
          <div className='hidden w-[40%] h-[40vh] border-2 border-black my-8 pt-2' ref={activegamesref}></div>

          {/* room opens for game creator after clicking create game */}
          <div className='lobby hidden w-[90%] h-[60vh] bg-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' ref={creatorgameroomref}>
            <p>Waiting for others to join</p>
          </div>

          {/* room opens for game joiner after clicking join game */}
          <div className='lobby hidden w-[90%] h-[60vh] bg-blue-400 absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' ref={joinergameroomref}>
            <p className='font-bold text-[1.5rem] text-center'>Waiting for game leader to start the game</p>
          </div>

        </div>
      }
    </div>
  )
}

export default App