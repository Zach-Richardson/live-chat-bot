<style>
div [class*="pull left"] {
  float: left;
  margin-left: 0.25em;
}
div [class*="pull right"] {
  float: right;
   margin-right: 0.25em;
}
.flexbox {
    display: flex;
    flex: 1;
    margin-right:0.5em;
}
.color-box {
    width: 10px;
    height: 10px;
    display: inline-block;
    background-color: #ccc;
    position: absolute;
    left: 5px;
    top: 5px;
}
</style>
 
<template lang="html">
    <div class="ui container left aligned">

          <sui-grid 
            style="padding-top:5%;"
            divided="vertically"
            v-for="question in questions">
            <sui-grid-row 
                :columns="1">
                <sui-grid-column>
                    <h2 class="pull left" style="display:inline;vertical-align:middle">
                        Question {{questions.indexOf(question)+1}}
                    </h2>
                    <sui-button
                        class="pull right"
                        color="red"
                        icon="trash"
                        @click="deleteQuestion(question)" />
                </sui-grid-column>
            </sui-grid-row>

            <sui-grid-row style="padding:0px">
                <sui-grid-column>
                    <sui-list relaxed>
                        <sui-list-item>
                            <sui-list-content>
                                <sui-label
                                    pointing="right"
                                    color="teal"
                                    style="vertical-align:middle">Type</sui-label>
                                <sui-dropdown
                                    selection
                                    placeholder="Question Type"
                                    :options="questionTypes"
                                    @input="checkForChanges()"
                                    v-model="question.type" />
                                <sui-label
                                    pointing="right"
                                    color="teal"
                                    style="vertical-align:middle; margin-left: 10px;">Prompt</sui-label>
                                <sui-input
                                    :style="$mq | mq({
                                        smallScreen: 'width:50%',
                                        bigScreen: 'width:70%'})"
                                    v-model="question.prompt"
                                    :value="question.prompt"
                                    @input="checkForChanges()"/>
                            </sui-list-content>
                        </sui-list-item>
                    </sui-list>
                </sui-grid-column>
            </sui-grid-row>
            <sui-grid-row v-if="question.type!=='Free Response'">
                <sui-grid-column>
                    <sui-grid 
                        v-for="response in question.responses">
                        <sui-grid-row :columns="1">
                            <sui-grid-column>
                                <sui-label
                                    pointing="right"
                                    color="teal"
                                    style="vertical-align:middle">Choice</sui-label>
                                <sui-input
                                    :style="$mq | mq({
                                            smallScreen: 'width:40%',
                                            bigScreen: 'width:30%'})"
                                    class="flexbox"
                                    v-model="response.text"
                                    :value="response.text"
                                    @input="checkForChanges()"/>                          
                                <sui-label
                                    pointing="right"
                                    color="teal"
                                    style="vertical-align:middle; margin-left: 10px;">Action</sui-label>
                                <sui-dropdown      
                                    selection
                                    :options="questionActions"
                                    v-model="response.action"
                                    @input="checkForChanges()"/>
                                <sui-icon
                                    name="arrow right"
                                    size="large" />
                                <span v-if="response.action==='Forward to Question'">
                                    <sui-dropdown   
                                        selection
                                        placeholder="Question"
                                        :options="questionsForDropdown"
                                        v-model="response.actionOption"
                                        @input="checkForChanges()"/>
                                </span>
                                <span v-if="response.action==='Forward to Tag'">
                                    <sui-dropdown      
                                        selection
                                        placeholder="Tag"
                                        :options="tagsForDropdown"
                                        v-model="response.tagId"
                                        @input="updateTagData(response)"/>
                                </span>
                                <sui-dropdown
                                    button
                                    :class="response.color">
                                    <sui-dropdown-menu selection>
                                        <sui-dropdown-item
                                            v-for="color in colorsForDropdown"
                                            @click="setResponseColor(response, color.text)"
                                            :value="color.text">
                                            <sui-icon 
                                                name="stop"
                                                :color="color.text" />
                                        </sui-dropdown-item>
                                    </sui-dropdown-menu>
                                </sui-dropdown>
                                <sui-button 
                                    color="red"
                                    icon="trash alternate outline"
                                    style="vertical-align:middle"
                                    @click="deleteResponse(question, response)" />
                            </sui-grid-column>
                        </sui-grid-row>
                    </sui-grid>
                <sui-button
                    style="margin-top:25px"
                    color="green"
                    content="Add"
                    @click="newResponse(question)"
                    v-if="question.type==='Multiple Choice'"/>
                </sui-grid-column>
            </sui-grid-row>
            
            <sui-grid-row
                class="left aligned"
                v-if="question.type==='Free Response'">
                <sui-grid-column>
                    <sui-list divided relaxed>
                        <sui-list-item>
                            <sui-list-content style="color:#777">                          
                                <sui-label
                                    pointing="right"
                                    color="teal"
                                    style="vertical-align:middle">Action</sui-label>
                                <sui-dropdown      
                                    selection
                                    :options="questionActions"
                                    v-model="question.responses[0].action"
                                    @input="checkForChanges()"/>
                                <sui-icon
                                    name="arrow right"
                                    size="large" />
                                <span v-if="question.responses[0].action==='Forward to Question'">
                                    <sui-dropdown   
                                        selection
                                        placeholder="Question"
                                        :options="questionsForDropdown"
                                        v-model="question.responses[0].actionOption"
                                        @input="checkForChanges()"/>
                                </span>
                                <span v-if="question.responses[0].action==='Forward to Tag'">
                                    <sui-dropdown      
                                        selection
                                        placeholder="Tag"
                                        :options="tagsForDropdown"
                                        v-model="question.responses[0].tagId"
                                        @input="updateTagData(question.responses[0])"/>
                                </span>
                            </sui-list-content>
                        </sui-list-item>
                    </sui-list>
                </sui-grid-column>
            </sui-grid-row>
        </sui-grid>

        <div style="margin-bottom:100px">
            <sui-divider />
            <sui-button
                class="ui large green button pull left"
                content="New Question"
                @click="newQuestion()" />

            <sui-button
                class="ui large blue button pull right"
                content="Save Changes" 
                @click="saveData()"
                v-if="changesMade" />
        </div>
        

        <div>
            <sui-modal v-model="showingSaveChangesModal">
                <sui-modal-header>Save Changes</sui-modal-header>
                <sui-modal-content>
                    <sui-modal-description>
                        <sui-header>Continue without saving changes?</sui-header>
                        <p>Your changes have not been saved.</p>
                    </sui-modal-description>
                </sui-modal-content>
                <sui-modal-actions style="padding:10px">
                    <sui-button 
                        class="yellow" 
                        floated="left"
                        @click="showingSaveChangesModal = false"
                        content="Cancel" />
                    <sui-button 
                        class="red"
                        @click="nextRoute()"
                        content="Don't Save & Continue" />
                    <sui-button 
                        floated="right" 
                        class="green" 
                        @click="saveAndContinue()"
                        content="Save & Continue" />
                </sui-modal-actions>
            </sui-modal>
        </div>

    </div>
</template>
 
<script>
'use strict'
module.exports = {
    mounted: function() {
        this.loadData();
    },
    methods: {
        checkForChanges(){
            if(this.changesMade) return;
            if(JSON.stringify(this.questions) != this.questionsOriginal){
                this.changesMade = true;
            }
        },
        deleteResponse: function(question, response) {
            question.responses.splice(question.responses.indexOf(response),1);
            this.changesMade = true;
        },
        deleteQuestion: function(question) {
            this.questions.splice(this.questions.indexOf(question), 1);
            this.questionsForDropdown.splice(this.questions.indexOf(question), 1);
            this.changesMade = true;
        },
        loadData: function(){
            util.fetch.call(this, '/api/questions/', {method: 'get'})
            .then(result => {
                this.questionsOriginal = JSON.stringify(result.theJson);
                this.questions = result.theJson;
                this.questionsForDropdown = [];
                for(let i=0; i<this.questions.length; i++){
                    this.questionsForDropdown.push({
                        text: `Question ${i+1}`,
                        value: `Question ${i+1}`
                    });
                }
            });

            util.fetch.call(this, '/api/tags/', {method: 'get'})
            .then(result => {
                this.tags = result.theJson.tags;
                this.tags.forEach( (tag, idx) => {
                    this.tagsForDropdown.push({
                        text: tag.slug,
                        value: tag.id
                    });
                });
            });
        },
        newQuestion: function () {
            this.questions.push({
                prompt: "Question Prompt",
                type: "Multiple Choice",
                responses: [
                    {
                        text: "Yes",
                        action: 'Forward to Question',
                        actionOption: "Question 1",
                        tagId: null,
                        color: 'blue',
                        editing: true
                    },
                    {
                        text: "No",
                        action: 'Forward to Question',
                        actionOption: "Question 1",
                        tagId: null,
                        color: 'blue',
                        editing: true
                    }
                ]
            });
            this.questionsForDropdown.push({
                text: `Question ${this.questions.length}`,
                value: `Question ${this.questions.length}`
            });
            this.changesMade = true;
        },
        newResponse: function (question){
            question.responses.push({
                text: "New Response",
                action: "Forward to Question",
                actionOption: `Question ${this.questions.indexOf(question)+1}`,
                distId: null,
                color: 'blue',
                editing: false
            });
            this.changesMade = true;
        },
        saveAndContinue: function() {
            this.saveData();
            this.nextRoute();
        },
        saveData: function() {
            util.fetch('/api/questions/', {
                method:'post',
                body: { questions: this.questions }
            });
            this.changesMade = false;
            this.questionsOriginal = JSON.stringify(this.questions);
        },
        setResponseColor: function(response, color) {
            this.checkForChanges();
            response.color = color;
        },
        updateTagData: function(response) {
            response.actionOption = this.tags.find(t => t.id === response.tagId).slug;
            this.checkForChanges();
        }
    },
    beforeRouteLeave: function(to, from, next){
        if(this.changesMade){
            this.showingSaveChangesModal = true;
            this.nextRoute = next;
            next(false);
        }else{
            next();
        }
    },
    data: function() {
        return {
            global: shared.state,
            changesMade: false,
            questions: [],
            questionsOriginal: [],
            questionsForDropdown: [],
            showingSaveChangesModal: false,
            nextRoute: null,
            tags: [],
            tagsForDropdown: [],
            questionActions: [
                {
                    text: "Forward to Question",
                    value: "Forward to Question"
                },
                {
                    text: "Forward to Tag",
                    value: "Forward to Tag"
                },
            ],
            questionTypes: [
                {
                    text: "Free Response",
                    value: "Free Response"
                },
                {
                    text: "Multiple Choice",
                    value: "Multiple Choice"
                }
            ],
            colorsForDropdown: [
                {
                    text: 'blue',
                    value: 'blue'
                },
                {
                    text: 'green',
                    value: 'green'
                },
                {
                    text: 'red',
                    value: 'red'
                },
                {
                    text: 'yellow',
                    value: 'yellow'
                }
            ]
        }
    }
}
</script>