// building graphql model
class Graphql_client {

    constructor(sessionId, mb_id) {
        this.sessionId = sessionId;
        this.mb_id = mb_id;
        this.subMessages = false;
        this.graphql_url = 'localhost:4000/graphql';
    }

    setLibraryObjects(graphql, Apollo) {
        this.graphql = graphql
        this.Apollo = Apollo
    }

    startGraphQl(callback) {

        // f/graphql.js usage
        this.graph = this.graphql('http://' + this.graphql_url, {
            headers: {
                "ssid": this.sessionId,
                "mbid": this.mb_id,
            },
            asJSON: true
        })

        // apollo client usage
        this.apolloClient = new this.Apollo.lib.ApolloClient({
            networkInterface: this.Apollo.lib.createNetworkInterface({
                uri: 'http://' + this.graphql_url,
                transportBatching: true,
            }),
            connectToDevTools: true,
        });

        // subscription
        this.subscriptionsClient = new window.SubscriptionsTransportWs.SubscriptionClient('ws://' + this.graphql_url, {
            reconnect: true,
            connectionParams: {
                "ssid": this.sessionId,
                "mbid": this.mb_id,
            }
        });

        this.subscriptionsClient.onConnected(() => {
            console.log('subscriptionsClient Connected!!');
        });

        this.subscriptionsClient.onReconnected(() => {
            console.log('subscriptionsClient Reconnected!!');
        });

        this.subscriptionsClient.onError(() => {
            console.log('subscriptionsClient Error!!');
        });

        this.subscribeChannel(result => {
            callback(result)
        })
    }

    subscribeChannel(callback) {

        const SUB_QUERY = this.Apollo.gql`subscription($mb_id: String!) {
                updateChannel(mb_id: $mb_id) {
                    type
                    channel_id
                    channel_title
                    message_index
                    opener_mb_id
                    invitees_mb_id
                    opener_last_message_index
                    invitees_last_message_index
                    opener_last_message_date
                    invitees_last_message_date

                    users {
                        mb_id
                        mb_nick
                    }
                    messages {
                        index
                        mb_id
                        content
                        date_created
                    }
                }
            }`;

        this.subChannels = this.subscriptionsClient.request({
            query: SUB_QUERY,
            variables: {"mb_id": this.mb_id}
        }).subscribe({
            next: (res) => {
                let str_channel_id = res.data.updateChannel.channel_id;
                let str_type = res.data.updateChannel.type ? res.data.updateChannel.type : "";
                let str_messages = res.data.updateChannel.messages[0] ? res.data.updateChannel.messages[0].content : '등록된 글이 없습니다.';
                let str = `<div>[${str_channel_id}] :: ${str_type} - ${str_messages}</div>`;
                callback(res.data)
            },
            error: console.error
        });

    }

    endGraphql() {
        this.subscriptionsClient.close();
    }

    async refillChannelTicket(refill_type) {
        try {
            let response = await this.graph(`mutation RefillChannelTicket($type: String!) {
                    refillChannelTicket(type: $type) {
                        mb_id,
                        count_channel_ticket
                    }
                }`, {
                type: refill_type
            })
            console.log(response)
        } catch (err) {
            console.log(err)
        }
    }

    async createChannel(invitees_mb_id) {

        // f/graphql.js usage
        this.graph = graphql('http://' + this.graphql_url, {
            headers: {
                "ssid": this.sessionId,
                "mbid": this.mb_id,
            },
            asJSON: true
        })

        try {
            const response = await this.graph(`mutation CreateChannel($input: ChannelInput!) {
                    createChannel(input: $input) {
                        id,
                        channel_id,
                        channel_type,
                        is_active,
                        date_created,
                        date_last_update,
                        message_index,
                        opener_mb_id,
                        invitees_mb_id
                    }
                }`, {
                "input": {
                    "channel_type": "OTO",
                    "opener_mb_id": this.mb_id,
                    "invitees_mb_id": invitees_mb_id,
                }
            })
            return response
        } catch (err) {
            throw err
        }
    }

    async addBlacklist(invitees_mb_id) {
        try {
            let response = await this.graph(`mutation AddBlacklist($mb_id: String!) {
                    addBlacklist(mb_id: $mb_id) {
                        mb_id,
                        mb_nick,
                        mb_level,
                        blacklist
                    }
                }`, {
                "mb_id": invitees_mb_id
            })
            console.log(response)
            return true
        } catch (err) {
            console.log(err)
            return false
        }
    }

    async removeBlacklist(invitees_mb_id) {
        try {
            let response = await this.graph(`mutation RemoveBlacklist($mb_id: String!) {
                    removeBlacklist(mb_id: $mb_id) {
                        mb_id,
                        mb_nick,
                        mb_level,
                        blacklist
                    }
                }`, {
                "mb_id": invitees_mb_id
            })
            console.log(response)
        } catch (err) {
            console.log(err)
        }
    }

    async deleteChannel(channel_id) {
        try {
            let response = await this.graph(`mutation DeleteChannel($id: ID!) {
                    deleteChannel(id: $id) {
                        id,
                        channel_id,
                        channel_type,
                        is_active,
                        date_created,
                        date_last_update,
                        message_index,
                        opener_mb_id,
                        invitees_mb_id
                    }
                }`, {
                "id": channel_id,
                // "id": $('#channel_id').val(),
            })
            console.log(response)
        } catch (err) {
            console.log(err)
        }
    }

    async getMessages(channel_id) {
        try {
            let response = await this.graph(`query Messages($channel_id: String!, $start_at: Int, $limit: Int) {
                    messages(channel_id: $channel_id, start_at: $start_at, limit: $limit) {
                        index,
                        mb_id,
                        content,
                        date_created
                    }
                }`, {
                "channel_id": channel_id,
                "start_at": 9,
                "limit": 3
            })
            console.log(response)
        } catch (err) {
            console.log(err)
        }
    }

    async sendMessage(channel_id, message) {
        try {
            let response = await this.graph(`mutation CreateMessage($input: MessageInput!) {
                    createMessage(input: $input) {
                        id,
                        content,
                        date_created
                        type
                        channel_id
                        mb_id
                    }
                }`, {
                "input": {
                    "channel_id": channel_id,
                    "mb_id": this.mb_id,
                    "content": message
                }
            })
            console.log(response)
            return true
        } catch (err) {
            console.log(err)
            return false
        }
    }

    enterChannel(channel_id, callback) {

        const SUB_QUERY = this.Apollo.gql`subscription($channel_id: String!) {
                updateMessage(channel_id: $channel_id) {
                    type
                    index
                    id
                    mb_id
                    content
                    date_created
                    channel_id
                }
            }`;

        this.subMessages = this.subscriptionsClient.request({
            query: SUB_QUERY,
            variables: {"channel_id": channel_id}
        }).subscribe({
            next: (res) => {
                console.log('NEW MSG: ', res.data)
                callback(res.data);
            },
            error: console.error
        });

        this.setUserActive("Y", channel_id).then(() => {
            console.log('entered channel')
        })

    }

    async leaveChannel(channel_id) {
        try {
            this.subMessages.unsubscribe();
            await this.setUserActive("N", channel_id)
            return true
        } catch (err) {
            console.log(err)
        }

    }

    async setUserActive(isActive, channel_id) {

        try {
            let response = await this.graph(`mutation UpdateChannel($input: ChannelInput!) {
                    updateChannel(input: $input) {
                        id,
                        channel_id,
                        date_created
                    }
                }`, {
                "input": {
                    "channel_id": channel_id,
                    "is_active": isActive
                }
            })
            console.log(response)
        } catch (err) {
            console.log(err)
        }

    }

}

export default Graphql_client