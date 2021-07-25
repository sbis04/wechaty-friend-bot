const { Wechaty, Friendship, log } = require("wechaty");

const qrTerm = require("qrcode-terminal");

const welcome = `
=============== Powered by Wechaty ===============
-------- https://github.com/Chatie/wechaty --------

Hello,

I'm a Wechaty Botie with the following super powers:

1. Send Friend Request
2. Accept Friend Request
3. Recongenize Verify Message

If you send friend request to me,
with a verify message 'ding',
I will accept your request automaticaly!
__________________________________________________

Hope you like it, and you are very welcome to
upgrade me for more super powers!

Please wait... I'm trying to login in...

`;

console.log(welcome);

const bot = new Wechaty({
  name: "friend-bot",
  puppet: "wechaty-puppet-wechat4u"
});

bot
  .on("login", (user) => log.info("Bot", `${user.name()} logined`))
  .on("logout", (user) => log.info("Bot", `${user.name()} logouted`))
  .on("error", (e) => log.info("Bot", "error: %s", e))
  .on("scan", (qrcode, status) => {
    qrTerm.generate(qrcode, { small: true });
    console.log(`${qrcode}\n[${status}] Scan QR Code in above url to login: `);
  })
  /**
   *
   * Wechaty Event: `friend`
   *
   */
  .on("friendship", async (friendship) => {
    let logMsg;
    const fileHelper = bot.Contact.load("filehelper");

    try {
      logMsg = "received `friend` event from " + friendship.contact().name();
      await fileHelper.say(logMsg);
      console.log(logMsg);

      switch (friendship.type()) {
        /**
         *
         * 1. New Friend Request
         *
         * when request is set, we can get verify message from `request.hello`,
         * and accept this request by `request.accept()`
         */
        case Friendship.Type.Receive:
          if (friendship.hello() === "ding") {
            logMsg = 'accepted automatically because verify messsage is "ding"';
            console.log("before accept");
            await friendship.accept();

            // if want to send msg , you need to delay sometimes
            await new Promise((r) => setTimeout(r, 1000));
            await friendship.contact().say("hello from Wechaty");
            console.log("after accept");
          } else {
            logMsg =
              "not auto accepted, because verify message is: " +
              friendship.hello();
          }
          break;

        /**
         *
         * 2. Friend Ship Confirmed
         *
         */
        case Friendship.Type.Confirm:
          logMsg = "friend ship confirmed with " + friendship.contact().name();
          break;

        default:
          break;
      }
    } catch (e) {
      logMsg = e.message;
    }

    console.log(logMsg);
    await fileHelper.say(logMsg);
  });

bot.start().catch(async (e) => {
  log.error("Bot", "init() fail: %s", e);
  await bot.stop();
  process.exit(-1);
});
