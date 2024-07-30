import { useEffect, useRef, useState } from 'react'
import './App.css'
import axios from 'axios';
import {GoogleButton} from 'react-google-button'
import { auth, db } from './firebase'
import {GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut} from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import {BsXLg} from 'react-icons/bs'


function App() {
  const [User, setUser] = useState('');
  const [Leader, setLeader] = useState('');
  const [Opponent, setOpponent] = useState('');
  const [gameended, setgameended] = useState('');
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
  const testref = useRef();
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
    activegamesref.current.textContent = "There are currently no games";
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
    setOpponent("fishchipsy123@gmail.com");

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
          // if (person.data().email != User.email) {
          //   setOpponent(person.data().email);
          //   setTimeout(() => {
          //     console.log(Opponent);
          //     console.log(person.data().email);
          //   }, 900);
          // }
        })

        for (let i = 0; i < creatorgameroomref.current.children.length - 2; i++) {
          creatorgameroomref.current.children[i].remove();
        }
        
        //after someone joins the creator's room, the button to start the game will appear
        setTimeout(() => {
          // if (creatorgameroomref.current.children[creatorgameroomref.current.children.length - 1].textContent == "End Game") {
          //   creatorgameroomref.current.children[creatorgameroomref.current.children.length - 1].remove();
          //   creatorgameroomref.current.children[creatorgameroomref.current.children.length - 2].remove();
          // }
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
            document.querySelectorAll('.lobby')[0].style.display = "none";

            // setTimeout(() => {
            //   onSnapshot(collection(db, `game ${User.email}`), (snapshot) => {
            //     snapshot.docs.forEach(person => {
            //       deleteDoc(doc(db, `game ${User.email}`, person.data().email))
            //     })
            //   })
            // }, 2000);
          }
        }, 1000);

      }
    })
  }
let zzz = false;
  useEffect(() => {
    if (Leader != "") {
      onSnapshot(collection(db, `game ${Leader}`), (snapshot) => {
        if (snapshot.docs[0].data().open == "false") {
          joinergameroomref.current.textContent = "";
          joinergameroomref.current.style = "display: none";
        }

        if (snapshot.docs[0].data().active == "true" && zzz == false) {
          gameroomref.current.style = "display: block";
          document.querySelectorAll('.lobby')[0].style.display = "none";
          document.querySelectorAll('.lobby')[1].style.display = "none";

          console.log("Opponent: ", Opponent);
          getDoc(doc(db, `game ${Leader}`, Opponent)).then(data => {
            if (gameended != "true" && data.data().health == 0) {
              if (gameroomref.current.style.display == "none") {
                return;
              }
              gameroomref.current.style = "display: none";
              if (Leader == User.email) {
                document.querySelectorAll('.lobby')[0].style.display = "block";
                document.querySelectorAll('.lobby')[0].textContent = "";
              } else {
                document.querySelectorAll('.lobby')[1].style.display = "block";
                document.querySelectorAll('.lobby')[1].textContent = "";
              }
              setgameended("true");
              zzz = true;
            }
            opponentnameref.current.textContent = data.data().name;
            opponenthealthref.current.textContent = data.data().health;
          })
          getDoc(doc(db, `game ${Leader}`, User.email)).then(data => {
            if (data.data().health == 0) {
              gameroomref.current.style = "display: none";
              if (Leader == User.email) {
                document.querySelectorAll('.lobby')[0].style.display = "block";
                document.querySelectorAll('.lobby')[0].textContent = "";
              } else {
                document.querySelectorAll('.lobby')[1].style.display = "block";
                document.querySelectorAll('.lobby')[1].textContent = "";
              }
              setgameended("true");
              zzz = true;
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

  function test() {
    onSnapshot(collection(db, User.email), (snapshot) => {
      quizletdata = snapshot.docs[0].data().data;
    })
    setTimeout(() => {      
      testref.current.style.display = "block";

      const oddIndexes = quizletdata.map((_, index) => index).filter(index => index % 2 !== 0);
      for (let i = oddIndexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [oddIndexes[i], oddIndexes[j]] = [oddIndexes[j], oddIndexes[i]];
      }
      console.log(oddIndexes);
      let arr = [];
      oddIndexes.forEach(num => {
        arr.push(quizletdata[num]);
      })
      console.log(arr);

      let num = Math.ceil(oddIndexes.length/6);
      for (let i = 0; i < num; i++) {
        if (i % 2 == 0) {
          let main = document.createElement('div');
          main.style = "width: 100%; margin-bottom: 2rem; border-bottom: 2px solid gray;";
          let randomnum = Math.floor(Math.random() * 4) + (4*i);
          let term = document.createElement('div');
          term.textContent = quizletdata[oddIndexes[randomnum] - 1];
          term.style = "width: 100%; height: 5rem; text-align: center; font-size: 3rem;";
          main.append(term);
          let answerrow1 = document.createElement('div');
          answerrow1.style = "display: flex; justify-content: space-evenly; width: 100%";
          let answerrow2 = document.createElement('div');
          answerrow2.style = "display: flex; justify-content: space-evenly; width: 100%; margin-bottom: 2rem;";
          for (let j = 0 + (4*i); j < 4 + (4*i); j++) {
            let button = document.createElement('button');
            button.style = "font-size: 1.2rem";
            button.textContent = quizletdata[oddIndexes[j]];
            if (j - (4*i) == 0 || j - (4*i) == 1) {
              answerrow1.append(button);
            } else {
              answerrow2.append(button);
            }
            button.onclick = () => {
              answerrow1.children[0].style.border = "none";
              answerrow1.children[1].style.border = "none";
              answerrow2.children[0].style.border = "none";
              answerrow2.children[1].style.border = "none";
              if (term.textContent == quizletdata[oddIndexes[j]-1]) {
                button.style = "border: 2px solid green; border-radius: 10px; padding: 0.2rem";
              } else {
                button.style = "border: 2px solid red; border-radius: 10px; padding: 0.2rem";
              }
            }
          }
          main.append(answerrow1);
          main.append(answerrow2);
          testref.current.append(main);
        } else {
          let main = document.createElement('div');
          main.style = "width: 100%; margin-bottom: 2rem; font-size: 1.5rem; margin-left: 2rem; border-bottom: 2px solid gray";
          let sectionarr = [];
          for (let j = 0 + (4*i); j < 4 + (4*i); j++) {
            sectionarr.push(j);
            let div = document.createElement('div');
            div.style = "width: 100%; display: flex; margin-bottom: 1rem;";
            let term = document.createElement('div');
            term.textContent = quizletdata[oddIndexes[j] - 1];
            div.append(term);
            let definition = document.createElement('div');
            definition.style = "border: 1px dashed black; min-width: 7rem; margin-left: 1rem; overflow: auto; padding-left: 0.2rem; padding-right: 0.2rem";
            div.append(definition);
            main.append(div);
            definition.onclick = () => {
              main.children[0].children[1].style.border = "1px dashed black";
              main.children[1].children[1].style.border = "1px dashed black";
              main.children[2].children[1].style.border = "1px dashed black";
              main.children[3].children[1].style.border = "1px dashed black";
              definition.style.border = "2px dashed blue";
            }
          }
          for (let i = sectionarr.length - 1; i > 0; i--) {
            const j = Math.floor(Math.random() * (i + 1));
            [sectionarr[i], sectionarr[j]] = [sectionarr[j], sectionarr[i]];
          }
          let answerbank = document.createElement('div');
          answerbank.style = "width: 80%; display: flex; justify-content: space-between; font-size: 1rem; margin-bottom: 2rem;";
          for (let i = 0; i < 4; i++) {
            let div = document.createElement('button');
            div.textContent = quizletdata[oddIndexes[sectionarr[i]]];
            div.classList.add(sectionarr[i]);
            answerbank.append(div);
            div.onclick = () => {
              for (let i = 0; i < 4; i++) {
                if (main.children[i].children[1].style.border == "2px dashed blue") {
                  main.children[i].children[1].textContent = div.textContent;
                  main.children[i].children[1].classList = div.classList[0];
                }
              }
            }
          }
          main.append(answerbank);
          testref.current.append(main);
          let button = document.createElement('button');
          button.textContent = "Check";
          main.append(button);
          button.onclick = () => {
            for (let i = 0; i < 4; i++) {
              console.log(quizletdata[oddIndexes[main.children[i].children[1].classList[0]]-1]);
              if (main.children[i].children[0].textContent == quizletdata[oddIndexes[main.children[i].children[1].classList[0]]-1]) {
                main.children[i].children[1].style.border = "2px solid green";
              } else {
                main.children[i].children[1].style.border = "2px solid red";
              }
            }
          }
        }
      }

      for (let i = num*4; i < oddIndexes.length; i++) {
        let main = document.createElement('div');
        main.style = "font-size: 2rem; margin-bottom: 1rem; border-bottom: 2px solid gray; margin-left: 2rem;";
        let term = document.createElement('div');
        term.textContent = quizletdata[oddIndexes[i] - 1];
        let input = document.createElement('input');
        input.placeholder = "Your answer";
        input.style = "display: block; margin-top: 1rem; margin-bottom: 2rem; padding-left: 0.2rem;";
        main.append(term);
        main.append(input);
        testref.current.append(main);
        input.onkeydown = (e) => {
          if (e.key == "Enter") {
            console.log(quizletdata[oddIndexes[i]].toLowerCase());
            if (input.value.toLowerCase() == quizletdata[oddIndexes[i]].toLowerCase()) {
              input.style.border = "2px solid green";
            } else {
              input.style.border = "2px solid red";
            }
          }
        }
      }

      let exit = document.createElement('button');
      exit.style = "background: red; padding-top: 0.5rem; padding-bottom: 0.5rem; padding-left: 1rem; padding-right: 1rem; font-weight: bold; color: white; margin-bottom: 2rem; margin-left: 48%; font-size: 1.5rem; border-radius: 15px;";
      exit.textContent = "Exit";
      testref.current.append(exit);
      exit.onclick = () => {
        testref.current.textContent = "";
        testref.current.style = "display: none";
      }
    }, 1000);
  }

  return (
    <div>
      {
        !User ? <div>
          <p>Please sign in</p>
          <GoogleButton onClick={signinwithgoogle}/>
        </div> :
        <div>
          {/* this div will show when the game starts */}
          <div className='hidden absolute w-[98%] h-[99vh] bg-gray-400' ref={gameroomref}>
            <div ref={gameroomquestionsref}></div>
            <div ref={gameroomcastleref}>
              <div className='flex w-full justify-evenly'>
                <img className='w-[15rem] h-[15rem] z-10' src="../images/castle.png"/>
                <img className='w-[15rem] h-[15rem] z-10' src="../images/castle.png"/>
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
          <div ref={testref} className='hidden w-full bg-gray-300 h-[99vh] overflow-y-scroll overflow-x-hidden pt-8'>
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

          <button onClick={test} className='bg-blue-500 font-bold px-4 py-2 rounded-[15px] text-white block mb-4'>Test</button>
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