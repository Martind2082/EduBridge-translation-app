import { useEffect, useRef, useState } from 'react'
import './App.css'
import axios from 'axios';
import {GoogleButton} from 'react-google-button'
import { auth, db } from './firebase'
import {GoogleAuthProvider, onAuthStateChanged, signInWithPopup, signOut} from 'firebase/auth';
import { collection, deleteDoc, doc, getDoc, onSnapshot, orderBy, query, serverTimestamp, setDoc, updateDoc } from 'firebase/firestore';
import { FaArrowRight} from "react-icons/fa";
import { HiXMark } from "react-icons/hi2";
import { GoArrowLeft, GoArrowRight } from "react-icons/go";




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
  const translatefromref = useRef();
  const translatetoref = useRef();
  const translateinputref = useRef();
  const translateoutputref = useRef();
  const youtubevideosref = useRef();
  const gethelpfulvideosbuttonref = useRef();
  const creatorgameroompeopleref = useRef();
  const castlehealthref = useRef();
  const learnref = useRef();
  const joinergameroomrefpeople = useRef();
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

  function clickthis() {
    const options = {
      method: 'GET',
      url: "http://localhost:8000/translate",
      params: {text: "hello everyone"}
    }
    axios.request(options)
      .catch(err => console.log(err))
      .then(response => {
        console.log(response);
      })
  }
  
  function getyoutubevideo() {
    let search = translateoutputref.current.value;
    if (search.length == 0) {
      return;
    }
    gethelpfulvideosbuttonref.current.textContent = "Loading...";
    const options = {
      method: 'GET',
      url: "http://localhost:8000/youtube",
      params: {link: `https://www.youtube.com/results?search_query=${search}`}
    }
    axios.request(options)
      .catch(err => console.log(err))
      .then(response => {
        let code1 = response.data.arraylinks[0].split('&')[0].split('=')[1];
        let code2 = response.data.arraylinks[1].split('&')[0].split('=')[1];
        let code3 = response.data.arraylinks[2].split('&')[0].split('=')[1];
        youtubevideosref.current.children[0].src = `https://www.youtube.com/embed/${code1}`;
        youtubevideosref.current.children[0].style = "width: 50%; height: 20rem; margin-bottom: 1rem;";

        youtubevideosref.current.children[1].src = `https://www.youtube.com/embed/${code2}`;
        youtubevideosref.current.children[1].style = "width: 50%; height: 20rem; margin-bottom: 1rem;";

        youtubevideosref.current.children[2].src = `https://www.youtube.com/embed/${code3}`;
        youtubevideosref.current.children[2].style = "width: 50%; height: 20rem; margin-bottom: 1rem;";

        let button = document.createElement('button');
        button.textContent = "Clear Videos";
        button.style = "background: red; font-weight: bold; color: white; border-radius: 15px; padding: 0.5rem; margin-top: 1rem; margin-bottom: 1rem;";
        button.onclick = () => {
          button.remove();
          youtubevideosref.current.children[0].src = "";
          youtubevideosref.current.children[0].style = "height: 0px";
          youtubevideosref.current.children[1].src = "";
          youtubevideosref.current.children[1].style = "height: 0px";
          youtubevideosref.current.children[2].src = "";
          youtubevideosref.current.children[2].style = "height: 0px";
        }
        youtubevideosref.current.append(button);

        gethelpfulvideosbuttonref.current.textContent = "Get Helpful Videos";

      })
  }

  function submit() {
    if (link.current.value.length == 0) {
      return;
    }
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

        let container = document.createElement('div');
        container.style = "width: 80%; display: flex; justify-content: space-evenly; border: 1px solid black; padding-top: 1rem; padding-bottom; 1rem;";
        let term = document.createElement('div');
        let definition = document.createElement('div');
        term.textContent = "Term";
        definition.textContent = "Definition";
        container.append(term);
        container.append(definition);
        data.current.append(container);

        //displays the flashcards on screen term and definition side by side
        for (let i = 0; i < quizletdata.length; i+=2) {
          let maindiv = document.createElement("div");
          let div1 = document.createElement("div");
          let div2 = document.createElement("div");

          maindiv.style = 'display: flex; width: 80%; justify-content: space-evenly; border: 1px solid black; padding-top: 1rem; padding-bottom: 1rem;';
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
    activegamesref.current.style.display = "block";
    activegamesref.current.textContent = "";
    let nogames = document.createElement('div');
    nogames.textContent = "There are currently no games";
    nogames.style = "width: 100%; text-align: center";
    activegamesref.current.append(nogames);
    onSnapshot(collection(db, "games"), (snapshot) => {
      if (snapshot.docs.length != 0) {
        if (activegamesref.current.children[1].textContent == "There are currently no games") {
          activegamesref.current.children[1].remove();
        }
      }
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
          activegamesref.current.style.display = "none";
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

          joinergameroomref.current.style.display = "block";

          onSnapshot(collection(db, `game ${game.data().email}`), (snapshot) => {
            joinergameroomrefpeople.current.textContent = "";
            snapshot.docs.forEach(person => {
              let persondiv = document.createElement('div');
              persondiv.style = "margin-left: 2rem; display: flex; margin-top: 1rem; margin-bottom: 1rem;";

              let name = document.createElement('div');
              name.textContent = person.data().name;
              name.style = "font-size: 1.5rem";

              let img = document.createElement('img');
              img.src = person.data().pfp;
              img.style = "width: 3rem; border-radius: 50%; margin-right: 1rem";

              persondiv.append(img);
              persondiv.append(name);
              joinergameroomrefpeople.current.append(persondiv);
            })
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

    creatorgameroomref.current.style.display = "block";
    // creatorgameroompeopleref.current.textContent = "";

    let div = document.createElement('div');
    div.style = "display: flex; margin-left: 2rem; margin-top: 1rem; margin-bottom: 1rem;";

    let name = document.createElement('div');
    name.textContent = User.displayName;
    name.style = "font-size: 1.5rem";

    let img = document.createElement('img');
    img.style = "width: 3rem; border-radius: 50%; margin-right: 1rem;";
    img.src = User.photoURL;
    div.append(img);
    div.append(name);
    creatorgameroompeopleref.current.append(div);
    
    onSnapshot(collection(db, `game ${User.email}`), (snapshot) => {
      if (snapshot.docs.length !== 1) {
        creatorgameroompeopleref.current.textContent = "";

        if (snapshot.docs[0].data().email != User.email) {
          setOpponent(snapshot.docs[0].data().email)
        } else {
          setOpponent(snapshot.docs[1].data().email)
        }

        snapshot.docs.forEach(person => {
          let persondiv = document.createElement('div');
          persondiv.classList.add(person.data().email);
          persondiv.style = "display: flex; margin-left: 2rem; margin-top: 1rem; margin-bottom: 1rem;";

          let personname = document.createElement('div');
          personname.textContent = person.data().name;
          personname.style = "font-size: 1.5rem";

          let personimg = document.createElement('img');
          personimg.style = "width: 3rem; border-radius: 50%; margin-right: 1rem;";
          personimg.src = person.data().pfp;

          persondiv.append(personimg);
          persondiv.append(personname);

          creatorgameroompeopleref.current.append(persondiv);
          // if (person.data().email != User.email) {
          //   setOpponent(person.data().email);
          //   setTimeout(() => {
          //     console.log(Opponent);
          //     console.log(person.data().email);
          //   }, 900);
          // }
        })

        // for (let i = 0; i < creatorgameroomref.current.children.length - 2; i++) {
        //   creatorgameroomref.current.children[i].remove();
        // }

      }
    })
  }

useEffect(() => {
  if (gameended == "true") {
    updateDoc(doc(db, `game ${User.email}`, User.email), {
      active: "false"
    })
    updateDoc(doc(db, `game ${User.email}`, Opponent), {
      active: "false"
    })
  }
}, [gameended])

let gameendedvariable = false;
  useEffect(() => {
    if (Leader != "" && Opponent != "" && gameended != "true") {
      onSnapshot(collection(db, `game ${Leader}`), (snapshot) => {
        if (gameendedvariable) {
          return;
        }
        if (gameended == "true") {
          console.log('IS TRUE');
          return;
        }

        if (snapshot.docs[0].data().active == "true" && gameendedvariable == false) {
          gameroomref.current.style.display = "block";
          document.querySelectorAll('.lobby')[0].style.display = "none";
          document.querySelectorAll('.lobby')[1].style.display = "none";

          console.log("Opponent: ", Opponent);
          getDoc(doc(db, `game ${Leader}`, Opponent)).then(data => {
            if (gameended != "true" && data.data().health <= 0) {
              if (gameroomref.current.style.display == "none") {
                return;
              }
              console.log('ZERO');
              gameroomref.current.style.display = "none";
              updateDoc(doc(db, `game ${User.email}`, User.email), {
                active: "false"
              })
              updateDoc(doc(db, `game ${User.email}`, Opponent), {
                active: "false"
              })
              if (Leader == User.email) {
                document.querySelectorAll('.lobby')[0].style.display = "block";
              } else {
                document.querySelectorAll('.lobby')[1].style.display = "block";
              }
              setgameended("true");
              gameendedvariable = true;
            }
            opponentnameref.current.textContent = data.data().name;
            opponenthealthref.current.textContent = data.data().health;
          })
          getDoc(doc(db, `game ${Leader}`, User.email)).then(data => {
            if (gameended != "true" && data.data().health <= 0) {
              // if (gameroomref.current.style.display == "none") {
              //   return;
              // }
              updateDoc(doc(db, `game ${User.email}`, User.email), {
                active: "false",
              })
              updateDoc(doc(db, `game ${User.email}`, Opponent), {
                active: "false",
              })
              gameroomref.current.style.display = "none";
              if (Leader == User.email) {
                document.querySelectorAll('.lobby')[0].style.display = "block";
              } else {
                document.querySelectorAll('.lobby')[1].style.display = "block";
              }
              setgameended("true");
              gameendedvariable = true;
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
                  if (gameendedvariable == true) {
                    return;
                  } 
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
  })
  //Leader, Opponent, gameended

  function test() {
      if (!quizletdata) {
        return;
      }    
      testref.current.style.display = "block";

      const oddIndexes = quizletdata.map((_, index) => index).filter(index => index % 2 !== 0);
      for (let i = oddIndexes.length - 1; i > 0; i--) {
        const j = Math.floor(Math.random() * (i + 1));
        [oddIndexes[i], oddIndexes[j]] = [oddIndexes[j], oddIndexes[i]];
      }
      let arr = [];
      oddIndexes.forEach(num => {
        arr.push(quizletdata[num]);
      })

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
            definition.classList.add('hover');
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
        testref.current.style.display = "none";
      }
  }

  const countries = {
    "am-ET": "Amharic",
    "ar-SA": "Arabic",
    "be-BY": "Bielarus",
    "bem-ZM": "Bemba",
    "bi-VU": "Bislama",
    "bjs-BB": "Bajan",
    "bn-IN": "Bengali",
    "bo-CN": "Tibetan",
    "br-FR": "Breton",
    "bs-BA": "Bosnian",
    "ca-ES": "Catalan",
    "cop-EG": "Coptic",
    "cs-CZ": "Czech",
    "cy-GB": "Welsh",
    "da-DK": "Danish",
    "dz-BT": "Dzongkha",
    "de-DE": "German",
    "dv-MV": "Maldivian",
    "el-GR": "Greek",
    "en-GB": "English",
    "es-ES": "Spanish",
    "et-EE": "Estonian",
    "eu-ES": "Basque",
    "fa-IR": "Persian",
    "fi-FI": "Finnish",
    "fn-FNG": "Fanagalo",
    "fo-FO": "Faroese",
    "fr-FR": "French",
    "gl-ES": "Galician",
    "gu-IN": "Gujarati",
    "ha-NE": "Hausa",
    "he-IL": "Hebrew",
    "hi-IN": "Hindi",
    "hr-HR": "Croatian",
    "hu-HU": "Hungarian",
    "id-ID": "Indonesian",
    "is-IS": "Icelandic",
    "it-IT": "Italian",
    "ja-JP": "Japanese",
    "kk-KZ": "Kazakh",
    "km-KM": "Khmer",
    "kn-IN": "Kannada",
    "ko-KR": "Korean",
    "ku-TR": "Kurdish",
    "ky-KG": "Kyrgyz",
    "la-VA": "Latin",
    "lo-LA": "Lao",
    "lv-LV": "Latvian",
    "men-SL": "Mende",
    "mg-MG": "Malagasy",
    "mi-NZ": "Maori",
    "ms-MY": "Malay",
    "mt-MT": "Maltese",
    "my-MM": "Burmese",
    "ne-NP": "Nepali",
    "niu-NU": "Niuean",
    "nl-NL": "Dutch",
    "no-NO": "Norwegian",
    "ny-MW": "Nyanja",
    "ur-PK": "Pakistani",
    "pau-PW": "Palauan",
    "pa-IN": "Panjabi",
    "ps-PK": "Pashto",
    "pis-SB": "Pijin",
    "pl-PL": "Polish",
    "pt-PT": "Portuguese",
    "rn-BI": "Kirundi",
    "ro-RO": "Romanian",
    "ru-RU": "Russian",
    "sg-CF": "Sango",
    "si-LK": "Sinhala",
    "sk-SK": "Slovak",
    "sm-WS": "Samoan",
    "sn-ZW": "Shona",
    "so-SO": "Somali",
    "sq-AL": "Albanian",
    "sr-RS": "Serbian",
    "sv-SE": "Swedish",
    "sw-SZ": "Swahili",
    "ta-LK": "Tamil",
    "te-IN": "Telugu",
    "tet-TL": "Tetum",
    "tg-TJ": "Tajik",
    "th-TH": "Thai",
    "ti-TI": "Tigrinya",
    "tk-TM": "Turkmen",
    "tl-PH": "Tagalog",
    "tn-BW": "Tswana",
    "to-TO": "Tongan",
    "tr-TR": "Turkish",
    "uk-UA": "Ukrainian",
    "uz-UZ": "Uzbek",
    "vi-VN": "Vietnamese",
    "wo-SN": "Wolof",
    "xh-ZA": "Xhosa",
    "yi-YD": "Yiddish",
    "zu-ZA": "Zulu"
}
  function translate() {
    let apiurl = `https://api.mymemory.translated.net/get?q=${translateinputref.current.value}&langpair=${translatefromref.current.value}|${translatetoref.current.value}`;
    axios.get(apiurl).then(res => {
      translateoutputref.current.value = res.data.responseData.translatedText;
    })
  }
  useEffect(() => {
    setTimeout(() => {
      if (!User) {
        return;
      }
      for (const code in countries) {
        let option = document.createElement('option');
        option.innerText = countries[code];
        option.value = code;
        translatetoref.current.append(option);
      }
      for (const code in countries) {
        let option = document.createElement('option');
        option.innerText = countries[code];
        option.value = code;
        translatefromref.current.append(option);
      }

    }, 800);
  }, [User])

  function startgame() {
    // if (!Opponent) {
    //   console.log('hi')
    //   return;
    // }
    // if (castlehealthref.current.value == "cannotbe") {
    //   console.log('cannot be');
    //   return;
    // }
    console.log('helloooooooooooooooo');
    updateDoc(doc(db, `game ${User.email}`, User.email), {
      health: castlehealthref.current.value
    })
    updateDoc(doc(db, `game ${User.email}`, Opponent), {
      health: castlehealthref.current.value
    })
    onSnapshot(collection(db, `game ${User.email}`), (snapshot) => {
      snapshot.docs.forEach(person => {
        updateDoc(doc(db, `game ${User.email}`, person.data().email), {
          active: "true",
        })
      })
    })
  }

  function endgame() {
    deleteDoc(doc(db, "games", User.email))
    document.querySelectorAll('.lobby')[0].style.display = "none";
    creatorgameroomref.current.style.display = "none";

    setTimeout(() => {
      onSnapshot(collection(db, `game ${User.email}`), (snapshot) => {
        snapshot.docs.forEach(person => {
          deleteDoc(doc(db, `game ${User.email}`, person.data().email))
        })
      })
    }, 3000);
  }

  function learn() {
    if (!quizletdata) {
      return;
    }
      let learndata = quizletdata;
      learnref.current.style.display = "block";
      let div = document.createElement('div');
      div.style = "width: 70%; margin-left: 15%;";
      let div2 = document.createElement('div');
      div2.style = "display: flex; width: 70%; margin-left: 15%; align-items: center; justify-content: center; margin-top: 1rem;";
      let term = document.createElement('div');
      term.style = "border: 1px solid black; text-align: center; font-size: 1.5rem; padding-top: 1rem; padding-bottom: 1rem;";
      let input = document.createElement('input');
      input.placeholder = "Enter answer";
      input.style = "width: 30rem; padding: 0.3rem; margin-left: 1rem; border-radius: 10px;";
      let button = document.createElement('button');
      button.textContent = "Reveal Answer";
      button.style = "background: gray; font-weight: bold; padding: 0.3rem; border-radius: 15px; margin-left: 1rem; width: 10rem;";
      let star = document.createElement('img');
      star.style = "width: 2rem;"
      star.classList.add('hover');
      star.src = "../images/star.png";
      let div3 = document.createElement('div');
      div3.style = "width: 70%; display: flex; justify-content: space-between; margin-left: 15%; margin-top: 1rem;";
      let next = document.createElement('button');
      let back = document.createElement('button');
      next.textContent = "Next";
      next.classList.add('hover');
      back.textContent = "Back";
      back.classList.add('hover');
      next.style = "background: lightgreen; padding: 0.3rem; border-radius: 10px;";
      back.style = "background: lightgreen; padding: 0.3rem; border-radius: 10px;";
      div3.append(back);
      div3.append(next);

      let i = 0;
      term.textContent = learndata[i];
      div.append(term);
      div2.append(star);
      div2.append(input);
      div2.append(button);

      let starredtitle = document.createElement('div');
      starredtitle.textContent = "Starred Terms";
      starredtitle.style = "width: 100%; text-align: center; font-size: 1.2rem; margin-top: 2rem";
      let starred = document.createElement('div');
      starred.style = "width: 70%; margin-left: 15%; height: 20rem; background: lightblue; text-align: center; border-radius: 15px; font-size: 1.1rem; margin-top: 0.5rem; padding-top: 1rem;";

      let questionsleft = document.createElement('div');
      questionsleft.style = "font-size: 1.1rem; margin-left: 3rem; margin-bottom: 1rem;";
      questionsleft.textContent = `Question ${(i/2)+1} of ${learndata.length/2}`;

      learnref.current.append(questionsleft);
      learnref.current.append(div);
      learnref.current.append(div2);
      learnref.current.append(div3);
      learnref.current.append(starredtitle);
      learnref.current.append(starred);
      
      let starredonly = document.createElement('button');
      starredonly.textContent = "Practice with starred terms only";
      starredonly.style = "border-radius: 10px; padding-top: 0.2rem; padding-bottom: 0.2rem; padding-left: 1.5rem; padding-right: 1rem; background: #58b9f5; font-weight: bold; color: white; margin-top: 2rem; width: 50%; margin-left: 25%; margin-bottom: 2rem;";

      learnref.current.append(starredonly);

      let exit = document.createElement('button');
      exit.textContent = "Exit";
      exit.style = "background: red; padding-top: 0.5rem; padding-bottom: 0.5rem; padding-left: 3rem; padding-right: 3rem; font-weight: bold; color: white; margin-bottom: 2rem; margin-left: 48%; font-size: 1.5rem; border-radius: 15px; width: 40%; margin-left: 30%";
      learnref.current.append(exit);

      exit.onclick = () => {
        learnref.current.textContent = "";
        learnref.current.style.display = "none";
      }

      next.onclick = () => {
        if (i == learndata.length - 2) {
          i = 0;
        } else {
          i+=2;
        }
        term.textContent = learndata[i];
        input.value = "";
        input.style.border = "1px solid black";
        button.textContent = "Reveal Answer";
        questionsleft.textContent = `Question ${(i/2)+1} of ${learndata.length/2}`;
      }
      back.onclick = () => {
        if (i == 0) {
            i = learndata.length - 2
          } else {
            i-=2;
          }
          term.textContent = learndata[i];
          input.value = "";
          input.style.border = "1px solid black";
          button.textContent = "Reveal Answer";
          questionsleft.textContent = `Question ${(i/2)+1} of ${learndata.length/2}`;
      }
      


      star.onclick = () => {
        setDoc(doc(db, `star ${User.email}`, learndata[i]), {
          term: learndata[i],
          number: i
        })
      }
      onSnapshot(collection(db, `star ${User.email}`), (snapshot) => {
        starred.textContent = "";
        snapshot.docs.forEach(doc => {
          let div = document.createElement('div');
          div.style = "width: 100%; display: flex; justify-content: space-evenly; margin-top: 0.5rem; margin-bottom: 0.5rem;";
          div.id = doc.data().number
          let term = document.createElement('div');
          let remove = document.createElement('button');
          remove.style = "background: gray; padding: 0.2rem; border-radius: 10px";
          term.textContent = doc.data().term;
          remove.textContent = "Remove";

          div.append(term);
          div.append(remove);
          starred.append(div);

          remove.onclick = () => {
            deleteDoc(doc(db, `star ${User.email}`, term.textContent))
          }

        })
      })
  
      input.onkeydown = (e) => {
        if (e.key == "Enter") {
          if (input.value.length != 0) {
            if (learndata[i+1].replace(/[()]/g, '').toLowerCase() == input.value.replace(/[()]/g, '').toLowerCase()) {
              input.style.border = "2px solid green";
              if (i == learndata.length - 2) {
                i = 0;
              } else {
                i+=2;
              }
              setTimeout(() => {
                term.textContent = learndata[i];
                input.value = "";
                input.style.border = "1px solid black";
                button.textContent = "Reveal Answer";
                questionsleft.textContent = `Question ${(i/2)+1} of ${learndata.length/2}`;
              }, 600);
            } else {
              input.style.border = "2px solid red";
            }
          }
        }
      }

      starredonly.onclick = () => {
        if (starredonly.textContent == "Practice with starred terms only") {
          starredonly.textContent = "Practice with all terms";
          learndata = [];
          for (let i = 0; i < starred.children.length; i++) {
            learndata.push(starred.children[i].children[0].textContent);
            learndata.push(quizletdata[(starred.children[i].id) - -1]);
          }
          i = 0;
          term.textContent = learndata[i];
          input.value = "";
          input.style.border = "1px solid black";
          button.textContent = "Reveal Answer";
          questionsleft.textContent = `Question ${(i/2)+1} of ${learndata.length/2}`;
        } else {
          starredonly.textContent = "Practice with starred terms only";
          learndata = quizletdata;
          i = 0;
          term.textContent = learndata[i];
          input.value = "";
          input.style.border = "1px solid black";
          button.textContent = "Reveal Answer";
          questionsleft.textContent = `Question ${(i/2)+1} of ${learndata.length/2}`;
        }
      }

      button.onclick = () => {
        if (button.textContent == "Reveal Answer") {
          console.log(learndata);
          button.textContent = learndata[i+1];
        } else {
          button.textContent = "Reveal Answer";
        }
      }
  }

  function leavegame() {
    deleteDoc(doc(db, `game ${Leader}`, User.email))
    joinergameroomref.current.style.display = "none";
  }

  return (
    <div>
      {
        !User ? <div>
          <div>
            <img className='absolute w-[100%] h-[100vh]' src="https://img.freepik.com/free-vector/watercolor-international-human-solidarity-day-background_23-2149837203.jpg?t=st=1722405069~exp=1722408669~hmac=2faeb2906c688071cee6bb5b1e97461922a42c64df22a0f90ed54a04bf4da6bb&w=1060"/>
            <div className='absolute w-[70%] h-[50vh] flex flex-col items-center justify-center left-1/2 top-[40%] -translate-x-1/2 -translate-y-1/2'>
              <p className='font-bold text-[3rem]'>Welcome!</p>
              <p className='text-center text-[2rem]'>This website is dedicated to helping first generation low income students by promoting equality in access to education and breaking language barriers that first generation students often face</p>
              <p className='mt-8 text-[1.3rem]'>Sign in to get started</p>
              <GoogleButton onClick={signinwithgoogle}/>
            </div>
          </div>
        </div> :
        <div>
          {/* this div will show when the game starts */}
          <div className='hidden fixed w-[100%] h-[101vh] bg-gray-400 mt-[-2%]' ref={gameroomref}>
            <div ref={gameroomquestionsref}></div>
            <div ref={gameroomcastleref}>
              <div className='flex w-full justify-evenly'>
                <img className='w-[15rem] h-[15rem] z-1000' src="../images/castle.png"/>
                <img className='w-[15rem] h-[15rem] z-1000' src="../images/castle.png"/>
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

          <div ref={learnref} className='hidden fixed w-full bg-gray-300 h-[100vh] pt-8 z-20 mt-[-2%] overflow-x-hidden overflow-y-scroll'></div>
          <div ref={testref} className='hidden fixed w-full bg-gray-300 h-[99vh] overflow-y-scroll overflow-x-hidden pt-8 mt-[-2%]'></div>
          <div className='flex justify-between w-full h-8 items-center mb-4 mt-4'>
            <div className='ml-4 flex items-center'>
              <img className='rounded-[50%] w-8' src={User.photoURL}/>
              <p className='ml-4'>Welcome {User.displayName}!</p>
            </div>
            <button onClick={signout} className='bg-gray-400 py-1 px-2.5 rounded-[12px] mr-4'>Sign out</button>
          </div>

          <button onClick={clickthis}>click this</button>
          <div className='text-center w-[80%] ml-[10%] mb-4 text-[1.5rem] mt-8'>If you are more comfortable in a language other from English, translate a topic into a language that you are comfortable with and generate videos related to that topic in your preferred language!</div>
          <div className='w-[70%] flex flex-col items-center bg-gradient-to-r from-blue-400 to-blue-300 ml-[15%] pt-4 rounded-[20px] mb-8'>
            <div className='w-[90%] flex justify-evenly'>
              <input ref={translateinputref} placeholder='Enter Text' className='pl-2 rounded-[5px] border border-1 border-black h-[5rem] w-[49%]' type="text" />
              <input ref={translateoutputref} placeholder='Translation' className='pl-2 rounded-[5px] border border-1 border-black h-[5rem] w-[49%]' type="text" />
            </div>
            <div className='w-[60%] flex justify-evenly items-center mt-2 mb-2'>
              <select ref={translatefromref} className='w-[8rem] p-[0.2rem] rounded-[10px]'></select>
              <FaArrowRight/>
              <select ref={translatetoref} className='w-[8rem] p-[0.2rem] rounded-[10px]'></select>
            </div>
            <button onClick={translate} className='bg-yellow-500 w-[60%] my-4 px-4 py-[0.2rem] font-bold text-white rounded-[15px]'>Translate</button>
            <button ref={gethelpfulvideosbuttonref} onClick={getyoutubevideo} className='bg-green-400 font-bold text-white rounded-[15px] py-[0.4rem] px-4 w-[60%] mb-4'>Get Helpful Videos</button>
          </div>
          <div className='w-full flex flex-col items-center' ref={youtubevideosref}>
            <iframe className='h-0' allowFullScreen></iframe>
            <iframe className='h-0' allowFullScreen></iframe>
            <iframe className='h-0' allowFullScreen></iframe>
          </div>

          <div className='w-[90%] ml-[5%] text-[1.5rem] text-center mt-8 mb-4'>Free alternative to Quizlet premium! Enter the link of the quizlet you want to study and study for free. Includes a study game you can play with a friend where the goal is to destroy your friend's castle by answering questions correctly.</div>
          <div className='flex ml-8'>
              <input className='border-black border border-solid w-[70%] rounded-[5px] pl-2 py-[0.5rem]' ref={link} placeholder='Enter Quizlet Link'/>
              <button className='bg-green-400 px-[4rem] py-[0.6rem] rounded-[15px] ml-4 font-bold text-white' onClick={submit}>Enter</button>
          </div>
          <div className='mt-8 mb-4 text-[1.5rem] text-center'>Flashcards</div>
          <div className='border-2 border-black w-[80%] ml-[10%] rounded-[20px] mb-8 flex flex-col items-center h-[20rem] overflow-auto' ref={data}></div>

          <button onClick={test} className='bg-blue-500 font-bold ml-4 px-4 py-2 rounded-[15px] text-white mb-4'>Test</button>
          <button onClick={learn} className='bg-blue-500 font-bold ml-4 px-4 py-2 rounded-[15px] text-white mb-4'>Learn</button>
          <br></br>
          <button onClick={creategame} className='bg-green-400 ml-4 px-4 py-2 font-bold text-white rounded-[15px]'>Create Game</button>
          <span className='mx-8'>or</span>
          <button onClick={seegames} className='bg-green-400 mb-[5rem] px-4 py-2 font-bold text-white rounded-[15px]'>Join a Game</button>
          
          {/* menu that shows all avaiable games */}
          <div className='hidden fixed w-[40%] h-[50vh] bg-gray-200 border-2 border-black rounded-[15px] my-8 pt-2 top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 overflow-y-auto' ref={activegamesref}>
            <HiXMark onClick={() => {activegamesref.current.style.display = "none"}} className='text-[2rem] hover'/>
          </div>

          {/* room opens for game creator after clicking create game */}
          <div className='lobby hidden fixed w-[90%] h-[60vh] bg-blue-400 rounded-[15px] top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2' ref={creatorgameroomref}>
            <p className='text-[2rem] mt-4 text-center'>Waiting for others to join</p>
            <div ref={creatorgameroompeopleref}></div>
            <select className='ml-8 mb-6 p-2 rounded-[10px] hover' ref={castlehealthref}>
              <option value="cannotbe" disabled selected>Choose Castle Health</option>
              <option value="200">200</option>
              <option value="400">400</option>
              <option value="600">600</option>
              <option value="800">800</option>
              <option value="1000">1000</option>
              <option value="1500">1500</option>
            </select>
            <div>
              <button onClick={startgame} className='text-white font-bold bg-green-500 py-2 px-4 rounded-[15px] mx-8'>Start Game</button>
              <button onClick={endgame} className='text-white font-bold bg-red-500 px-4 py-2 rounded-[15px]'>End Game</button>
            </div>
          </div>

          {/* room opens for game joiner after clicking join game */}
          <div className='lobby hidden w-[90%] h-[60vh] bg-blue-400 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 rounded-[15px]' ref={joinergameroomref}>
            <p className='font-bold text-[1.5rem] text-center'>Waiting for game leader to start the game</p>
            <div ref={joinergameroomrefpeople}></div>
            <button onClick={leavegame} className='bg-red-400 text-white font-bold rounded-[15px] px-4 py-2 ml-8'>Leave Game</button>
          </div>

        </div>
      }
    </div>
  )
}

export default App