// ジェスチャーの種類
// 👍(Thumb_Up), 👎(Thumb_Down), ✌️(Victory), 
// ☝️(Pointng_Up), ✊(Closed_Fist), 👋(Open_Palm), 
// 🤟(ILoveYou)
function getCode(left_gesture, right_gesture) {
  let code_array = {
    "one": 1,
    "two": 2,
    "three": 3,
    "four": 4,
    "five": 5,
    "zero": 6,
  }
  let left_code = code_array[left_gesture];
  let right_code = code_array[right_gesture];
  // left_codeとright_codeを文字として結合
  let code = String(left_code) + String(right_code);
  return code;
}

function getCharacter(code) {
  const codeToChar = {
    "11": "a", "12": "b", "13": "c", "14": "d", "15": "e", 
    "21": "f", "22": "g", "23": "h", "24": "i", "25": "j",
    "31": "k", "32": "l", "33": "m", "34": "n", "35": "o",
    "41": "p", "42": "q", "43": "r", "44": "s", "45": "t",
    "51": "u", "52": "v", "53": "w", "54": "x", "55": "y",
    "61": "z", "65": "backspace", "66": " ", "56": "backspace"
  };
  return codeToChar[code] || "";
}

// 入力サンプル文章 
let sample_texts = [
  "the quick brown fox jumps over the lazy dog",
];

// ゲームの状態を管理する変数
// notready: ゲーム開始前 （カメラ起動前）
// ready: ゲーム開始前（カメラ起動後）
// playing: ゲーム中
// finished: ゲーム終了後
// ready, playing, finished
let game_mode = {
  now: "notready",
  previous: "notready",
};

let game_start_time = 0;
let gestures_results;
let cam = null;
let p5canvas = null;

function setup() {
  p5canvas = createCanvas(320, 240);
  p5canvas.parent('#canvas');

  // When gestures are found, the following function is called. The detection results are stored in results.
  let lastChar = "";
  let lastCharTime = millis();

  gotGestures = function (results) {
    gestures_results = results;

    if (results.gestures.length == 2) {
      if (game_mode.now == "ready" && game_mode.previous == "notready") {
        // ゲーム開始前の状態から、カメラが起動した後の状態に変化した場合
        game_mode.previous = game_mode.now;
        game_mode.now = "playing";
        game_start_time = millis();
        document.querySelector('input').value = ""; // 入力欄をクリア
        game_start_time = millis(); // ゲーム開始時間を記録
      }
      let left_gesture;
      let right_gesture;
      if (results.handedness[0][0].categoryName == "Left") {
        left_gesture = results.gestures[0][0].categoryName;
        right_gesture = results.gestures[1][0].categoryName;
      } else {
        left_gesture = results.gestures[1][0].categoryName;
        right_gesture = results.gestures[0][0].categoryName;
      }
      let code = getCode(left_gesture, right_gesture);
      let c = getCharacter(code);

      let now = millis();
      if (c === lastChar) {
        if (now - lastCharTime > 300) {
          // 1秒以上cが同じ値である場合の処理
          typeChar(c);
          lastCharTime = now;
        }
      } else {
        lastChar = c;
        lastCharTime = now;
      }
    }
  }
  function tyoeAssist(){
    //sample_textsを１文字ずつList化して、target_textに格納する
    let target_text = sample_texts[0].split("");
    // target_textの最初の文字をモニターに表示する
    if (target_text.length > 0) {
      document.querySelector('#message').innerText = target_text.join("");
    } else {
      document.querySelector('#message').innerText = "No text available";
    }
    

  }
  // --- ここから追加: 補助表示用DIVと入力監視 ---
  // createDiv で #message の上に補助表示エリアを重ねる
  const assistDiv = createDiv('').parent('#canvas')
    .style('position','absolute')
    .style('bottom','3em')
    .style('left','50%')
    .style('transform','translateX(-50%)')
    .style('padding','0.5em 1em')
    .style('background','rgba(255,255,255,0.8)')
    .style('font-size','1.2em')
    .style('font-weight','bold');
  // 文字→コードのマッピング
  const codeMap = {
    "a":"11","b":"12","c":"13","d":"14","e":"15",
    "f":"21","g":"22","h":"23","i":"24","j":"25",
    "k":"31","l":"32","m":"33","n":"34","o":"35",
    "p":"41","q":"42","r":"43","s":"44","t":"45",
    "u":"51","v":"52","w":"53","x":"54","y":"55",
    "z":"01","backspace":"05"," ":"00"
  };
  let prevVal = '';
  let mismatchFlag = false;
  function updateAssist() {
    const val = document.querySelector('input').value;
    let text = '';
    try {
      const tgt = sample_texts[0].split('');
      const idx = val.length;
      // 既にミスマッチ表示中はバックスペース入力を待つ
      if (mismatchFlag) {
        // バックスペースが押されたらミスマッチ解除
        if (prevVal.length > val.length) {
          mismatchFlag = false;
        } else {
          text = `backspace (${codeMap['backspace']})`;
          assistDiv.html(text);
          prevVal = val;
          return;
        }
      }
      // 新規入力で期待文字と異なる場合はミスマッチ表示開始
      if (val.length > prevVal.length && idx - 1 < tgt.length && val[idx - 1] !== tgt[idx - 1]) {
        mismatchFlag = true;
        text = `backspace (${codeMap['backspace']})`;
      }
      // 通常は次に入力すべき文字とコードを表示
      else if (!mismatchFlag && idx < tgt.length) {
        const ch = tgt[idx];
        text = `${ch} (${codeMap[ch]||''})`;
      }
    } catch (e) {}
    assistDiv.html(text);
    prevVal = val;
  }
  // 初期表示とリアルタイム更新
  const inp = document.querySelector('input');
  inp.addEventListener('input', updateAssist);
  updateAssist();
  setInterval(updateAssist, 100);
  // --- ここまで追加 ---
}

// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// ここから下は課題制作にあたって編集してはいけません。
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!
// !!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!!

// 入力欄に文字を追加する場合は必ずこの関数を使用してください。
function typeChar(c) {
  if (c === "") {
    console.warn("Empty character received, ignoring.");
    return;
  }
  // inputにフォーカスする
  document.querySelector('input').focus();
  // 入力欄に文字を追加または削除する関数
  const input = document.querySelector('input');
  if (c === "backspace") {
    input.value = input.value.slice(0, -1);
  } else {
    input.value += c;
  }

  let inputValue = input.value;
  // #messageのinnerTextを色付けして表示
  const messageElem = document.querySelector('#message');
  const target = messageElem.innerText;
  let matchLen = 0;
  for (let i = 0; i < Math.min(inputValue.length, target.length); i++) {
    if (inputValue[i] === target[i]) {
      matchLen++;
    } else {
      break;
    }
  }
  const matched = target.slice(0, matchLen);
  const unmatched = target.slice(matchLen);
  console.log(`Matched: ${matched}, Unmatched: ${unmatched}`);
  messageElem.innerHTML =
    `<span style="background-color:lightgreen">${matched}</span><span style="background-color:transparent">${unmatched}</span>`;




  // もしvalueの値がsample_texts[0]と同じになったら、[0]を削除して、次のサンプル文章に移行する。配列長が0になったらゲームを終了する
  if (document.querySelector('input').value == sample_texts[0]) {
    sample_texts.shift(); // 最初の要素を削除
    console.log(sample_texts.length);
    if (sample_texts.length == 0) {
      // サンプル文章がなくなったらゲーム終了
      game_mode.previous = game_mode.now;
      game_mode.now = "finished";
      document.querySelector('input').value = "";
      const elapsedSec = ((millis() - game_start_time) / 1000).toFixed(2);
      document.querySelector('#message').innerText = `Finished: ${elapsedSec} sec`;
    } else {
      // 次のサンプル文章に移行
      document.querySelector('input').value = "";
      document.querySelector('#message').innerText = sample_texts[0];
    }
  }

}


function startWebcam() {
  // If the function setCameraStreamToMediaPipe is defined in the window object, the camera stream is set to MediaPipe.
  if (window.setCameraStreamToMediaPipe) {
    cam = createCapture(VIDEO);
    cam.hide();
    cam.elt.onloadedmetadata = function () {
      window.setCameraStreamToMediaPipe(cam.elt);
    }
    p5canvas.style('width', '100%');
    p5canvas.style('height', 'auto');
  }

  if (game_mode.now == "notready") {
    game_mode.previous = game_mode.now;
    game_mode.now = "ready";
    document.querySelector('#message').innerText = sample_texts[0];
    game_start_time = millis();
  }
}


function draw() {
  background(127);
  if (cam) {
    image(cam, 0, 0, width, height);
  }
  // 各頂点座標を表示する
  // 各頂点座標の位置と番号の対応は以下のURLを確認
  // https://developers.google.com/mediapipe/solutions/vision/hand_landmarker
  if (gestures_results) {
    if (gestures_results.landmarks) {
      for (const landmarks of gestures_results.landmarks) {
        for (let landmark of landmarks) {
          noStroke();
          fill(100, 150, 210);
          circle(landmark.x * width, landmark.y * height, 10);
        }
      }
    }

    // ジェスチャーの結果を表示する
    for (let i = 0; i < gestures_results.gestures.length; i++) {
      noStroke();
      fill(255, 0, 0);
      textSize(10);
      let name = gestures_results.gestures[i][0].categoryName;
      let score = gestures_results.gestures[i][0].score;
      let right_or_left = gestures_results.handednesses[i][0].hand;
      let pos = {
        x: gestures_results.landmarks[i][0].x * width,
        y: gestures_results.landmarks[i][0].y * height,
      };
      textSize(20);
      fill(0);
      textAlign(CENTER, CENTER);
      text(name, pos.x, pos.y);
    }
  }

  if (game_mode.now == "notready") {
    // 文字の後ろを白で塗りつぶす
    let msg = "Press the start button to begin";
    textSize(18);
    let tw = textWidth(msg) + 20;
    let th = 32;
    let tx = width / 2;
    let ty = height / 2;
    rectMode(CENTER);
    fill(255, 100);
    noStroke();
    rect(tx, ty, tw, th, 8);
    fill(0);
    textAlign(CENTER, CENTER);
    text(msg, tx, ty);
  }
  else if (game_mode.now == "ready") {
    let msg = "Waiting for gestures to start";
    textSize(18);
    let tw = textWidth(msg) + 20;
    let th = 32;
    let tx = width / 2;
    let ty = height / 2;
    rectMode(CENTER);
    fill(255, 100);
    noStroke();
    rect(tx, ty, tw, th, 8);
    fill(0);
    textAlign(CENTER, CENTER);
    text(msg, tx, ty);
  }
  else if (game_mode.now == "playing") {
    // ゲーム中のメッセージ
    let elapsedSec = ((millis() - game_start_time) / 1000).toFixed(2);
    let msg = `${elapsedSec} [s]`;
    textSize(18);
    let tw = textWidth(msg) + 20;
    let th = 32;
    let tx = width / 2;
    let ty = th;
    rectMode(CENTER);
    fill(255, 100);
    noStroke();
    rect(tx, ty, tw, th, 8);
    fill(0);
    textAlign(CENTER, CENTER);
    text(msg, tx, ty);
  }
  else if (game_mode.now == "finished") {
    // ゲーム終了後のメッセージ
    let msg = "Game finished!";
    textSize(18);
    let tw = textWidth(msg) + 20;
    let th = 32;
    let tx = width / 2;
    let ty = height / 2;
    rectMode(CENTER);
    fill(255, 100);
    noStroke();
    rect(tx, ty, tw, th, 8);
    fill(0);
    textAlign(CENTER, CENTER);
    text(msg, tx, ty);
  }

}


