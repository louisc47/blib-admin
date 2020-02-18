import React from 'react';
import { StyleSheet, Text, View } from 'react-native';
import { Notifications } from 'expo';
import { CheckBox, Input, Button } from 'react-native-elements';

const contentful = require('contentful-management/dist/contentful-management.browser.min.js');

const client = contentful.createClient({
  accessToken: 'CFPAT-XQAWFy7Hi-Vu4lST3ULY7NSfM2QCuL5il9WrfaZegLI',
});

const _groupes = ['Tous', 'VIP', 'Non VIP'];

export default class extends React.Component {
  constructor(props) {
    super(props);
    this.state = {
      groupe: _groupes[0],
      title: '',
      body: '',
      users: null,
    };
  }

  onSubmit = async () => {
    const { groupe, title, body, users } = this.state;
    if (!groupe || groupe == '') alert("Merci de choisir un groupe d'envoie");
    else if (!title || title == '') alert('Le titre ne peux pas être vide');
    else if (!body || body == '') alert('Le message ne peux pas être vide');
    else {
      let to = [];
      if (groupe == 'Tous') {
        users.map(item => {
          let complete_id = item.fields.id['en-US'];
          to.push(complete_id);
        });
      } else if (groupe == 'VIP') {
        let filerUser = users.filter(e => e.fields.isMember['en-US']);
        filerUser.map(item => {
          let complete_id = item.fields.id['en-US'];
          to.push(complete_id);
        });
      } else if (groupe == 'Non VIP') {
        let filerUser = users.filter(e => !e.fields.isMember['en-US']);
        filerUser.map(item => {
          let complete_id = item.fields.id['en-US'];
          to.push(complete_id);
        });
      }
      const message = {
        to,
        title,
        body,
        sound: 'default',
      };
      const response = await fetch('https://exp.host/--/api/v2/push/send', {
        method: 'POST',
        headers: {
          Accept: 'application/json',
          'Accept-encoding': 'gzip, deflate',
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(message),
      });
      const data = response._bodyInit;
      alert(`Status & Response ID-> ${JSON.stringify(data)}`);
    }
  };

  getUsers = () => {
    client
      .getSpace('u1zc8c5fghbm')
      .then(space => space.getEntries())
      .then(res =>
        this.setState({
          users: res.items.filter(e => e.sys.contentType.sys.id == 'user'),
        }),
      );
  };

  componentDidMount() {
    this.getUsers();
  }

  render() {
    const { groupe } = this.state;
    return (
      <View style={{ padding: 30 }}>
        <View>
          <Text
            style={{ textAlign: 'center', fontWeight: 'bold', fontSize: 20 }}
          >
            Cible :{' '}
          </Text>
          <View style={{ flexDirection: 'row', justifyContent: 'center' }}>
            {_groupes.map((item, i) => (
              <CheckBox
                title={item}
                key={i}
                containerStyle={{ width: '30%' }}
                checked={groupe == item ? true : false}
                onPress={() => this.setState({ groupe: item })}
              />
            ))}
          </View>
          <View>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: 20,
                marginTop: 20,
              }}
            >
              Titre :
            </Text>
            <Input
              onChange={e => this.setState({ title: e.nativeEvent.text })}
              inputContainerStyle={{
                borderColor: 'black',
                borderWidth: 1,
                padding: 5,
              }}
            />
          </View>
          <View>
            <Text
              style={{
                textAlign: 'center',
                fontWeight: 'bold',
                fontSize: 20,
                marginTop: 20,
              }}
            >
              Message :
            </Text>
            <Input
              onChange={e => this.setState({ body: e.nativeEvent.text })}
              inputContainerStyle={{
                borderColor: 'black',
                borderWidth: 1,
                padding: 5,
              }}
              inputStyle={{ fontSize: 14 }}
            />
          </View>
        </View>
        <Button
          title="Envoyer la notification"
          containerStyle={{ marginTop: 20 }}
          onPress={this.onSubmit}
        />
      </View>
    );
  }
}
