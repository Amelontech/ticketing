const { Listener } = require('@eartharoid/dbf');
const {
	EmbedBuilder,
	inlineCode,
} = require('discord.js');

module.exports = class extends Listener {
	constructor(client, options) {
		super(client, {
			...options,
			emitter: client.commands,
			event: 'error',
		});
	}

	async run({
		command,
		error,
		interaction,
	}) {
		const ref = require('crypto').randomUUID();
		this.client.log.error.commands(ref);
		this.client.log.error.commands(`"${command.name}" command execution error:`, error);
		let locale = null;
		if (interaction.guild) {
			locale = (await this.client.prisma.guild.findUnique({
				select: { locale: true },
				where: { id: interaction.guild.id },
			})).locale;
		}
		const getMessage = this.client.i18n.getLocale(locale);
		const fields = [
			{
				name: getMessage('misc.error.fields.identifier'),
				value: inlineCode(ref),
			},
		];
		if (error.name) {
			fields.unshift({
				name: getMessage('misc.error.fields.code'),
				value: inlineCode(error.name),
			});
		}
		const data = {
			components: [],
			embeds: [
				new EmbedBuilder()
					.setColor('Orange')
					.setTitle(getMessage('misc.error.title'))
					.setDescription(getMessage('misc.error.description'))
					.addFields(fields),
			],
		};

		interaction.reply(data).catch(() => interaction.editReply(data));
	}
};
