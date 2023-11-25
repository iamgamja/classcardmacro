function sleep(n) {
  return new Promise((res, req) => {
    setTimeout(() => {
      res();
    }, n);
  });
}

function set(name, value) {
  chrome.storage.local.set({ [name]: value });
}

function get(name) {
  return new Promise((res, rej) => {
    chrome.storage.local.get([name], (result) => {
      res(result[name]);
    });
  });
}

const onoffbtn = document.createElement("button");
onoffbtn.style.position = "fixed";
onoffbtn.style.width = "100px";
onoffbtn.style.height = "100px";
onoffbtn.style.top = "0px";
onoffbtn.style.right = "100px";
document.querySelector("body").appendChild(onoffbtn);

window.addEventListener(
  "load",
  async () => {
    // set("running", false);

    const onoff = (await get("onoff")) ?? true;
    if (!onoff) {
      // off
      onoffbtn.innerText = "ON";
      onoffbtn.addEventListener("click", () => {
        set("onoff", true);
        set("running", false);
        set("idx", 0);
        location.reload();
      });
      return; // off 상태이므로 아무것도 안함
    }
    // on
    onoffbtn.innerText = "OFF";
    onoffbtn.addEventListener("click", () => {
      set("onoff", false);
      set("running", false);
      set("idx", 0);
      location.reload();
    });

    // is lobby?
    const setitems = [...document.querySelectorAll("div.set-name")].slice(1);
    const countall = setitems.length;
    let idx = (await get("idx")) ?? 0;

    if (setitems.length) {
      // 1. lobby
      const btn = document.createElement("button");
      btn.style.position = "fixed";
      btn.style.width = "100px";
      btn.style.height = "100px";
      btn.style.top = "0px";
      btn.style.right = "0px";
      document.querySelector("body").appendChild(btn);

      btn.innerText = `${idx + 1} / ${countall}\nSTART`;

      const running = await get("running");
      if (!running) {
        // 실행중이 아님
        btn.addEventListener("click", () => {
          set("running", true);
          set("idx", 0);
          setitems[0].children[0].click();
        });
      } else {
        // 실행중임
        idx++;
        set("idx", idx);
        if (idx == countall) {
          // 끝남
          set("running", false);
          set("idx", 0);
          location.reload();
        }
        setitems[idx].children[0].click();
      }
      return;
    }

    // is set?
    const setname = document.querySelector(".set-name-header")?.textContent;
    if (setname) {
      // 2. set

      // 단어 긁어오기
      let 단어 = await get(`word ${setname}`);
      if (!단어) {
        document
          .querySelector(
            `body > div.mw-1080 > div.p-b-sm > div.set-body.m-t-25.m-b-lg > div:nth-child(2) > div > ul > li:nth-child(1) > a`
          )
          .click();
        document.querySelector(`#is_show_back`).click();
        단어 = {};

        [...document.querySelectorAll("div.flip-card-inner")].forEach((e) => {
          const x =
            e.children[0].children[0].children[0].children[0].textContent.trim();
          const y =
            e.children[1].children[0].children[0].children[0].textContent.trim();
          단어[x] = y;
          단어[y] = x;
        });

        // set(`word ${setname}`, 단어);
      }

      set("lastword", 단어); // lastword에 캐시?

      const buttons = document.querySelector(
        "body > div.bottom-fixed > div > div.cc-table.fill-parent.m-t"
      );

      // 암기
      const 암기 = buttons.children[0].children[0];
      const 리콜 = buttons.children[0].children[1];
      const 테스트 = buttons.children[1].children[0];

      if (암기.children.length === 1) {
        // 암기 하기
        암기.click();
        return;
      }

      if (리콜.children.length === 1) {
        // 리콜 하기
        리콜.click();
        return;
      }

      if (테스트.children.length === 1) {
        // 테스트 하기
        테스트.click();
        return;
      }

      // 전부 함
      document
        .querySelector(
          `body > div.mw-1080 > div.border-b > div > div > div.main-top-logo.w-290.middle.font-24.font-bold > a > div > div > div`
        )
        .click();

      return;
    }

    const 단어 = await get("lastword");

    const title_ = document.querySelector(
      `#wrapper-test > div > div.quiz-start-div > div.layer.retry-layer.box > div.m-t-sm.font-bolder.font-72`
    )?.textContent;

    const titlestr = document.querySelector(
      `#wrapper-learn > div.start-opt-body > div > div > div > div.font-20.font-bold2.text-center.m-b-md`
    )?.textContent;
    const isduringtest = document.querySelector(
      `#wrapper-test > div > div.layer.test-layer > div.m-t-lg.cc-table.middle.fill-parent-w.test-bottom > div:nth-child(1) > div.quiz-direction.text-center.font-bolder.text-7c.m-t`
    );
    if (isduringtest) {
      // 테스트 중인듯

      document
        .querySelector(
          `#wrapper-test > div > div.quiz-start-div > div.layer.retry-layer.box > div.m-t-xl > a`
        )
        ?.click();
      document
        .querySelector(
          `#wrapper-test > div > div.quiz-start-div > div.layer.prepare-layer.box.bg-gray.text-white > div.text-center.m-t-md > a`
        )
        ?.click();

      let realanswer; // 문제 보고 매번 대입해야 할듯
      const timer = setInterval(() => {
        const count = parseInt(
          document
            .querySelector(
              `#wrapper-test > div > div.layer.test-layer > div.text-center.p-b-sm > div > span.current-quest-num`
            )
            .textContent.trim()
        );
        const totalcount = parseInt(
          document
            .querySelector(
              `#wrapper-test > div > div.layer.test-layer > div.text-center.p-b-sm > div > span.text-gray > span`
            )
            .textContent.trim()
        );
        if (count === totalcount) {
          // 10초 후 나가기
          setTimeout(async () => {
            clearInterval(timer);
            document
              .querySelector(
                `body > div:nth-child(6) > div > div:nth-child(1) > a.btn-top-menu.btn-home`
              )
              .click();
            await sleep(1000);
            document
              .querySelector(
                `#confirmModal > div.modal-dialog > div > div.text-center.m-t-xl > a.btn.btn-primary.shadow.btn-ok.m-l-xs`
              )
              .click();
          }, 10000);
        }

        const question =
          document.querySelector(
            `#testForm > div.flip-card.showing > div > div.flip-card-front > div.box > div.cc-table.middle.fill-parent.font-36 > div > div`
          ) ||
          document.querySelector(
            `#testForm > div.flip-card.showing.flip > div > div.flip-card-front > div.box > div.cc-table.middle.fill-parent.font-32 > div > div`
          );
        if (question) {
          realanswer = 단어[question.textContent];
          console.log(realanswer);
        }

        // 정답을 찾기

        const items = [
          ...document.querySelectorAll(
            `#testForm > div.flip-card.showing.flip > div > div.flip-card-back > div > div.cc-radio-box-body > div`
          ),
        ];

        if (items.length) {
          for (let i = 0; i < 6; i++) {
            const answer =
              items[i].children[1].children[0].children[0].textContent;
            if (realanswer === answer) {
              items[i].children[0].click();
              break;
            }
          }
        }

        document.dispatchEvent(
          new KeyboardEvent("keyup", { keyCode: 32, which: 32 })
        );
      }, 100);
    } else if (titlestr.includes("암기")) {
      document
        .querySelector(
          `#wrapper-learn > div.start-opt-body > div > div > div > div.m-t > a`
        )
        .click();

      const timer = setInterval(() => {
        const btn1 = document.querySelector(
          `#wrapper-learn > div.cc-table.fill-parent-h.middle.m-center > div > div.study-bottom > div.btn-text.btn-down-cover-box > a`
        );
        if (btn1) btn1.click();

        const btn2 = document.querySelector(
          `#wrapper-learn > div.cc-table.fill-parent-h.middle.m-center > div > div.study-bottom.down > div.btn-text.btn-know-box > a`
        );
        if (btn2) btn2.click();

        const btn3 = document.querySelector(
          `#wrapper-learn > div.cc-table.fill-parent-h.middle.m-center > div > div.study-content.cc-table.middle.pos-relative > div.learn-btn-next > a`
        );
        if (btn3) btn3.click();

        const count = parseInt(
          document
            .querySelector(
              `#wrapper-learn > div.cc-table.fill-parent-h.middle.m-center > div > div.study-top > span.text-success > span`
            )
            .textContent.trim()
        );
        const totalcount = parseInt(
          document
            .querySelector(
              `#wrapper-learn > div.cc-table.fill-parent-h.middle.m-center > div > div.study-top > span.text-gray > span`
            )
            .textContent.trim()
        );
        if (count === totalcount) {
          // 0.5초 후 나가기
          setTimeout(() => {
            clearInterval(timer);
            document
              .querySelector(
                `body > div.study-header-body.mw-1080 > div > div:nth-child(1) > div:nth-child(1) > a`
              )
              .click();
          }, 500);
        }
      }, 100);
    } else if (titlestr.includes("리콜")) {
      document
        .querySelector(
          `#wrapper-learn > div.start-opt-body > div > div > div > div.m-t > a`
        )
        .click();

      const timer = setInterval(() => {
        const count = parseInt(
          document
            .querySelector(
              `#wrapper-learn > div.cc-table.fill-parent-h.middle.m-center > div > div.study-top > span.text-success > span`
            )
            .textContent.trim()
        );
        const totalcount = parseInt(
          document
            .querySelector(
              `#wrapper-learn > div.cc-table.fill-parent-h.middle.m-center > div > div.study-top > span.text-gray > span`
            )
            .textContent.trim()
        );
        if (count === totalcount) {
          // 0.5초 후 나가기
          setTimeout(() => {
            clearInterval(timer);
            document
              .querySelector(
                `body > div.study-header-body.mw-1080 > div > div:nth-child(1) > div:nth-child(1) > a`
              )
              .click();
          }, 500);
        }

        const btn1 = document.querySelector(
          `#wrapper-learn > div.cc-table.fill-parent-h.middle.m-center > div > div.study-bottom.down > div.btn-text.btn-next-box > a`
        );
        if (btn1) {
          btn1.click();
          return;
        }

        // 정답을 찾기

        const items = [
          ...document.querySelectorAll(
            `#wrapper-learn > div.cc-table.fill-parent-h.middle.m-center > div > div.study-content.cc-table.middle > div.study-body.fade.in > div.CardItem.current.showing > div.card-quest.card-quest-front > div`
          ),
        ];

        for (let i = 0; i < 4; i++) {
          const answer = items[i].children[1].children[0].textContent.trim();
          const question = document
            .querySelector(
              `#wrapper-learn > div.cc-table.fill-parent-h.middle.m-center > div > div.study-content.cc-table.middle > div.study-body.fade.in > div.CardItem.current.showing > div.card-top > div > div > div > div.text-normal > span`
            )
            .textContent.trim();
          const realanswer = 단어[question];
          if (realanswer === answer) {
            items[i].click();
            break;
          }
        }
      }, 100);
    } else {
    }
  },
  false
);
