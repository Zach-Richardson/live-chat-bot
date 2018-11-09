<style>
.hover-grey:hover{
    background-color:#ddd;
}
</style>

<template lang="html">
    <div class="ui container left aligned">

        <div class="ui basic segment" style="padding-top:5%">
            <h2 class="ui header">
                Chat...
            </h2>
        </div>

    </div>
</template>

<script>
'use strict'
const csvStringify = require('csv-stringify');
const fileSaver = require('file-saver');
const _ = require('lodash');
const moment = require('moment');

module.exports = {
    data: () => ({ 
        global: shared.state,
    }),
    watch: {
        queryString: function(val) {
            this.getMessages();
        }
    },
    methods: {
    },
    mounted: function() {
    }
}       
</script>