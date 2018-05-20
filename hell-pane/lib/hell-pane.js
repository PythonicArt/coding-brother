'use babel';

import HellPaneView from './hell-pane-view';
import ListView from './list-view';
import { CompositeDisposable, Disposable} from 'atom';
import Fun from './fun';
import Record from './record';
import Sql from './sql';

import * as Common from './common';

export default {

    hellPaneView: null,
    modalPanel: null,
    subscriptions: null,

    activate(state) {

        this.subscriptions = new CompositeDisposable(
            // Add an opener for our view.
            atom.workspace.addOpener(uri => {
                if (uri === 'atom://active-editor-info') {
                    return new HellPaneView();
                }
            }),

            // Register command that toggles this view
            atom.commands.add('atom-workspace', {
                'hell-pane:gen_key_data': () => this.gen_data('key'),
                'hell-pane:gen_py_data': () => this.gen_data('py'),
                'hell-pane:gen_pp_data': () => this.gen_data('pp'),
                'hell-pane:test_some': () => this.test_some()
            }),

            // Destroy any ActiveEditorInfoViews when the package is deactivated.
            new Disposable(() => {
                atom.workspace.getPaneItems().forEach(item => {
                    if (item instanceof HellPaneView) {
                        item.destroy();
                    }
                });
            }),

        );
    },

    deactivate() {
        this.modalPanel.destroy();
        this.subscriptions.dispose();
        this.hellPaneView.destroy();
    },

    serialize() {
        return {
            hellPaneViewState: this.hellPaneView.serialize()
        };
    },

    gen_data(Type){
        const editor = atom.workspace.getActiveTextEditor();
        if(editor){
            const selection = editor.getSelectedText();
            let oMod = this.ParserMod(selection);
            let sResult = '';
            if (oMod){
                switch (Type) {
                    case 'key':
                    sResult = oMod.gen_key_data(selection);
                    break;
                    case 'py':
                    sResult = oMod.gen_py_data(selection);
                    break;
                    case 'pp':
                    sResult = oMod.gen_pp_data(selection);
                    break;
                }
            }
            else{
                sResult = 'bad selection!!!!'
            }
            alert(sResult);
            atom.clipboard.write(sResult);
            atom.workspace.toggle('atom://active-editor-info');
        }
    },

    // get_py_data(selection){
    //
    // },
    //
    // get_pp_data(selection){
    //
    // },
    //
    // gen_key_data(selection) {
    //   let sSpec ='fun,f1函数1,1\n\
    //   request\n\
    //   fie1,int,字段1\n\
    //   fie2,int,字段2\n\
    //   reply\n\
    //   fie3,int,字段3\n';
    //   let sResult = this.ParserMod(sSpec);
    //   return sResult;
    // },
    //
    ParserMod(sSpec){
        var sList = sSpec.split('\n');
        var modSpec = sList[0];
        var dataList = sList.slice(1);

        var specList = modSpec.split(',');
        var modType = specList[0];
        var obj = null;

        switch (modType) {
        case 'fun': obj = Fun; break;
        case 'record': obj = Record; break;
        case 'sql': obj = Sql; break;
        }

        if(obj){
            let oMod = Common.create_mod_by_slist(obj, specList.slice(1), dataList);
            return oMod;
        }
        else{
            return null;
        }
    },

    deserializeActiveEditorInfoView(serialized) {
        return new HellPaneView();
    },

    test_some(){
        this.listView = new ListView()
    }

};
