/* eslint-disable indent */
/* eslint-disable no-case-declarations */
import { CardFactory, MessageFactory } from 'botbuilder';
import GaleforceModule from 'galeforce';

const galeforce = new GaleforceModule({
    'riot-api': {
        key: process.env.RIOT_API_KEY
    },
    'rate-limit': {
        type: 'bottleneck',
        cache: {
            type: 'internal'
        }
    }
});

const config = {
    name: 'lol',
    description: 'Find imformation about League of Legends',
    usage: '[message]',
    cooldown: 3
};

const langData = {
    en_US: {
        error: 'Error, try again later.',
        noMessage: 'Please enter a message.'
    },
    vi_VN: {
        error: 'Đã có lỗi xảy ra...',
        noMessage: 'Vui lòng nhập nội dung.'
    }
};

const getSummoners = async (names) => {
    const promises = names.map(summoner => galeforce.lol.summoner().region(galeforce.region.lol.VIETNAM).name(summoner).exec());
    return await Promise.all(promises);
};

const getTotalMastery = async (summonerId) => {
    const totalMasteryPoints = (await galeforce.lol.mastery.list()
        .region(galeforce.region.lol.VIETNAM)
        .summonerId(summonerId)
        .exec())
        .reduce((previous, current) => previous + current.championPoints, 0);
    return totalMasteryPoints;
};

const parseCard = ({ summoner, mastery }) => {
    return CardFactory.heroCard(
        summoner.name,
        [`https://ddragon.leagueoflegends.com/cdn/11.6.1/img/profileicon/${summoner.profileIconId}.png`],
        CardFactory.actions([
            {
                type: 'openUrl',
                title: 'View Profile',
                value: `https://lmssplus.com/profile/${summoner.name}`
            }
        ]),
        {
            subtitle: `Level ${summoner.summonerLevel}`,
            text: `Total mastery points: ${new Intl.NumberFormat('vi-VN').format(mastery)}`
        }
    );
};

async function onCall({ context, params, getLang }) {
    try {
        if (!params || !params.length) {
            return context.sendMessage(getLang('noMessage'));
        }
        switch (params[0]) {
            case 'summoner':
                const summoners = await getSummoners(params.slice(1));
                const masterys = await Promise.all(summoners.map(summoner => getTotalMastery(summoner.id)));

                return context.sendActivity(MessageFactory.carousel(summoners.map((summoner, index) => parseCard({
                    summoner,
                    mastery: masterys[index]
                }))));

            case 'default':
                break;
        }
    } catch (e) {
        console.error(e);
        context.sendMessage(`${getLang('error')} ${e.message}`);
    }
};

export default {
    config,
    langData,
    onCall
};
