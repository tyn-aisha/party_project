
const g = (name, color, time, aitu, items) => ({ name, color, time, aitu, items });


const party = [
  { key: 'balcony', name: 'Balcony', floor: 2, guests: [
    g('Aigerim', 'green',  '20:45', true,  ['cup', 'crumbs']),
    g('Aliya',   'black',  '21:15', false, ['phone', 'cup']),
    g('Madina',  'green',  '22:10', false, ['phone', 'bag', 'crumbs']),
    g('Ivan',    'black',  '20:10', true,  ['cup'])
  ] },
  { key: 'hall', name: 'Hall', floor: 2, guests: [
    g('Arman',   'yellow', '20:35', true,  ['bag', 'glasses']),
    g('Sophia',  'purple', '21:20', true,  ['phone']),
    g('Dias',    'green',  '19:45', true,  []),
    g('Bekzat',  'purple', '20:55', false, ['bag', 'cup', 'crumbs']),
    g('Aruzhan', 'black',  '21:50', true,  ['phone']),
    g('Saule',   'green',  '21:25', false, ['glasses'])
  ] },
  { key: 'kitchen', name: 'Kitchen', floor: 1, guests: [
    g('Nurlan',  'red',    '19:40', true,  ['phone', 'cup']),
    g('Emma',    'black',  '20:15', false, ['bag']),
    g('Timur',   'green',  '21:05', true,  ['phone', 'bag', 'crumbs']),
    g('Sergey',  'yellow', '20:50', false, []),
    g('Yerlan',  'red',    '21:40', true,  ['glasses', 'phone']),
    g('Kamila',  'black',  '20:05', false, ['cup'])
  ] },
  { key: 'living', name: 'Living room', floor: 1, guests: [
    g('Daniel',  'blue',   '19:55', false, ['glasses']),
    g('Zarina',  'green',  '21:10', false, ['bag', 'phone', 'crumbs']),
    g('Natasha', 'yellow', '20:30', true,  []),
    g('Askar',   'black',  '21:00', true,  ['phone']),
    g('Inkar',   'purple', '20:20', false, ['bag'])
  ] }
];

const MIRAS = g('Miras', 'blue', '21:20', true, ['phone']); 
const ICONS = { phone: '📱', glasses: '👓', bag: '👜', cup: '☕', crumbs: '🍰' };
const toMin = t => { const [h, m] = t.split(':'); return +h * 60 + +m; };


function buildCard(gu, roomKey) {
  const cls = ['guest', 'color-' + gu.color]
    .concat(gu.aitu ? ['aitu'] : [], gu.items.map(i => 'has-' + i)).join(' ');
  const $pic = $('<div class="pic">').append($('<img class="avatar">').attr({
    src: 'https://api.dicebear.com/9.x/open-peeps/svg?seed=' + gu.name, alt: gu.name }));
  if (gu.aitu) $pic.append('<span class="badge" title="AITU student">🎓</span>');
  return $('<div>').attr({
    'class': cls,
    'data-id': gu.name.toLowerCase(), 'data-name': gu.name, 'data-color': gu.color,
    'data-time': gu.time, 'data-minutes': toMin(gu.time), 'data-aitu': String(gu.aitu),
    'data-items': gu.items.join(' '), 'data-room': roomKey
  }).append(
    $pic,
    $('<div class="gname">').text(gu.name),
    $('<div class="gtime">').text('⏱ ' + gu.time),
    $('<div class="gicons">').text(gu.items.map(i => ICONS[i]).join(' '))
  );
}

function render() {
  const $house = $('#house').empty();
  [2, 1].forEach(f => {
    const $rooms = $('<div class="rooms">');
    party.filter(r => r.floor === f).forEach(r => {
      $rooms.append($('<div class="room">')
        .attr({ 'data-room': r.key, 'data-title': r.name, 'data-floor': f })
        .append($('<h3 class="room-title">').text(r.name),
                $('<div class="guests">').append(...r.guests.map(gu => buildCard(gu, r.key)))));
    });
    $house.append($('<section class="floor">').attr('data-floor', f)
      .append($('<div class="floor-label">').text('FLOOR ' + f), $rooms));
  });
  $(document).trigger('party:rendered');
}


const CASES = [
  { n: 1,  q: 'Who is in the hall?',
    run: () => $('.room[data-room="hall"] .guest') },
  { n: 2,  q: 'Who is dressed in yellow or purple?',
    run: () => $('.guest.color-yellow, .guest.color-purple') },
  { n: 3,  q: 'Which AITU students are upstairs?',
    run: () => $('.floor[data-floor="2"] .guest.aitu') },
  { n: 4,  q: 'Who has glasses or a bag?',
    run: () => $('.guest.has-glasses, .guest.has-bag') },
  { n: 5,  q: 'Who came with nothing at all?',
    run: () => $('.guest[data-items=""]') },
  { n: 6,  q: 'Who has a phone but no bag?',
    run: () => $('.guest.has-phone:not(.has-bag)') },
  { n: 7,  q: 'Who arrived between 20:30 and 21:00 (both included)?',
    run: () => $('.guest').filter((i, el) => $(el).data('minutes') >= 1230 && $(el).data('minutes') <= 1260) },
  { n: 8,  q: 'Who arrived after 21:00 and is not an AITU student?',
    run: () => $('.guest:not(.aitu)').filter((i, el) => $(el).data('minutes') > 1260) },
  { n: 9,  q: 'Who stands right next to Askar?',
    run: () => $('.guest[data-name="Askar"]').prev().add($('.guest[data-name="Askar"]').next()) },
  { n: 10, q: 'Who stands last in each room?',
    run: () => $('.guest:last-child') },
  { n: 11, q: 'Who stands third in each room?',
    run: () => $('.guest:nth-child(3)') },
  { n: 12, q: 'Who stands after Timur in his room?',
    run: () => $('.guest[data-name="Timur"]').nextAll() },
  { n: 13, q: 'Who stands right before someone in black?',
    run: () => $('.guest.color-black').prev('.guest') },
  { n: 14, q: 'In which room is Aruzhan?',
    run: () => $('.guest[data-name="Aruzhan"]').closest('.room') },
  { n: 15, q: 'Which rooms have fewer than 6 guests?',
    run: () => $('.room').filter((i, el) => $(el).find('.guest').length < 6) },
  { n: 16, q: 'In which rooms does somebody have a cup, but nobody wears glasses?',
    run: () => $('.room:has(.guest.has-cup):not(:has(.guest.has-glasses))') },
  { n: 17, q: 'Who came first to each room?',
    run: () => $('.room').map((i, room) => $(room).find('.guest').toArray()
                 .sort((a, b) => $(a).data('minutes') - $(b).data('minutes'))[0]) },
  { n: 18, q: 'Miras (AITU, blue, 21:20, phone) joins between Askar and Inkar.',
    note: 'Miras appeared between Askar and Inkar.',
    run: () => buildCard(MIRAS, 'living').hide().insertAfter('.guest[data-name="Askar"]').fadeIn(700) },
  { n: 19, q: 'Natasha says goodbye and goes home.', removes: true,
    note: 'Her card faded away and was removed from the page.',
    run: () => $('.guest[data-name="Natasha"]').fadeOut(700, function () { $(this).remove(); }) },
  { n: 20, q: 'Who took the cake?',
    note: 'The thief!',
    run: () => $('.floor[data-floor="1"] .guest.has-crumbs:not(.has-cup)')
                 .filter((i, el) => $(el).data('minutes') > 1260 && $(el).data('minutes') < 1290)
                 .filter((i, el) => $(el).prev().add($(el).next()).is('.aitu')) }
];


function jump($els) {
  $els.animate({ bottom: 18 }, { duration: 160, queue: false,
    complete: function () { $(this).animate({ bottom: 0 }, { duration: 160, queue: false }); } });
}

function runCase(c) {
  render();                                   
  const $r = c.run();
  const isRoom = $r.first().is('.room');
  const names = $r.map((i, el) => $(el).data(isRoom ? 'title' : 'name')).get();
  $r.addClass('found');
  if (!c.removes) jump($r);
  $('#result').html('<b>Case ' + c.n + ':</b> ' + c.q + '<br>Found <b>' + $r.length + '</b> ' +
    (isRoom ? 'room(s)' : 'guest(s)') + ': ' + (names.join(', ') || 'nobody') +
    (c.note ? '<br><i>' + c.note + '</i>' : ''));
  $('#chain').text(c.run.toString().replace(/^\(\)\s*=>\s*/, ''));
  $(document).trigger('case:done', [$r, isRoom]);
}

$(function () {
  CASES.forEach(c => $('<button>').html('<span class="n">' + c.n + '.</span>' + c.q)
    .on('click', () => runCase(c)).appendTo('#cases'));
  render();
});
