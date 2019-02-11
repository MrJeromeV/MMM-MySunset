/* Magic Mirror
 * Module: MMM-MySunset
 *
 * By JeromeV
 * MIT License
 */
Module.register("MMM-MySunset", {

    // Module config defaults.
    defaults: {
        lat: "36.7201600",                        // latitude
        lng: "-4.4203400",                        // longitude
		image: "world",                           // world, map or static (for graph)
		imageOnly: "no",                          // no = all data, yes = only animated image choice
		dayOrNight: "night", // "night" approaching, "day" approaching (imageOnly must be "yes")
        useHeader: false,                         // true if you want a header
        header: "On to the heart of the sunrise", // Any text you want. useHeader must be true
        maxWidth: "300px",
        animationSpeed: 3000,
        initialLoadDelay: 1250,
        retryDelay: 2500,
        updateInterval: 5 * 60 * 1000,           // 5 minutes

    },

    getStyles: function() {
        return ["MMM-MySunSet.css"];
    },

    getScripts: function() {
        return ["moment.js"];
    },

    start: function() {
        Log.info("Starting module: " + this.name);

        requiresVersion: "2.1.0",

        //  Set locale.
        this.url = "https://api.sunrise-sunset.org/json?lat=" + this.config.lat + "&lng=" + this.config.lng + "&date=today&formatted=0";
        this.SunRiseSet = {};
        this.scheduleUpdate();
    },

    getDom: function() {

        var wrapper = document.createElement("div");
        wrapper.className = "wrapper";
        wrapper.style.maxWidth = this.config.maxWidth;

        if (!this.loaded) {
            wrapper.innerHTML = "On to the heart of the sunrise";
            wrapper.classList.add("bright", "light", "small");
            return wrapper;
        }

        if (this.config.useHeader != false) {
            var header = document.createElement("header");
            header.classList.add("xsmall", "bright", "light");
            header.innerHTML = this.config.header;
            wrapper.appendChild(header);
        }

        var SunRiseSet = this.SunRiseSet;
        var lat = this.config.lat; // latitude
        var lng = this.config.lng; // longitude


        var top = document.createElement("div");
        top.classList.add("list-row");

        // sunrise set to local time using moment
        var sunrise = document.createElement("div");
        sunrise.classList.add("small", "bright", "sunrise");
        sunrise.innerHTML = "Le soleil se lève à " + moment(SunRiseSet.sunrise).local().format("HH:mm") + " <BR> "
							+ "et se couche à " + moment(SunRiseSet.sunset).local().format("HH:mm");
        wrapper.appendChild(sunrise);

        return wrapper;
    },


/////  Add this function to the modules you want to control with voice //////

    notificationReceived: function(notification, payload) {
        if (notification === 'HIDE_SUNRISE') {
            this.hide(1000);
        }  else if (notification === 'SHOW_SUNRISE') {
            this.show(1000);
        }

    },


    processSunRiseSet: function(data) {
        this.SunRiseSet = data;
        this.loaded = true;
    },

    scheduleUpdate: function() {
        setInterval(() => {
            this.getSunRiseSet();
        }, this.config.updateInterval);
        this.getSunRiseSet(this.config.initialLoadDelay);
    },

    getSunRiseSet: function() {
        this.sendSocketNotification('GET_SUNRISESET', this.url);
    },

    socketNotificationReceived: function(notification, payload) {
        if (notification === "SUNRISESET_RESULT") {
            this.processSunRiseSet(payload);

            this.updateDom(this.config.animationSpeed);
        }
        this.updateDom(this.config.initialLoadDelay);
    },
});
