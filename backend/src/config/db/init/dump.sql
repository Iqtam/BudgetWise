INSERT INTO users (id, email, role,firebase_uid) VALUES
('5e967e16-0b2a-415c-8ac0-bf811452149a', 'abc@gmail.com','user','wxLs1fRSr1hSJoXDmOYaKUGyBxl2');

INSERT INTO user_profiles (id, user_id, full_name, profile_picture_url, date_of_birth, gender, country, occupation) VALUES
('1dc560a5-5621-485d-b3a8-cf4046e3c4c9', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Chad Anderson', 'https://placeimg.com/551/1012/any', '1989-04-24', 'Female', 'Bosnia and Herzegovina', 'Psychiatrist');

INSERT INTO category (id, user_id, name, icon_url, type, parent_id) VALUES
('df684eb1-0f8e-4a81-a5af-a75120b49736', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Car', 'https://placeimg.com/639/142/any', 'income', NULL),
('e46d61d1-6f3f-46e1-aa50-da22620be7ed', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Such', 'https://placeimg.com/492/421/any', 'income', NULL),
('8a7f290b-6f65-4b75-acc4-059517791551', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Positive', 'https://www.lorempixel.com/379/940', 'expense', NULL),
('593ca629-934d-42b0-8a73-19b9a75e90de', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Teach', 'https://www.lorempixel.com/833/829', 'income', NULL),
('606cd162-51ef-4be4-9056-7b0c9557b16d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Of', 'https://www.lorempixel.com/420/392', 'income', NULL),
('c3d9bd4e-4447-4c57-9a9f-da08ac1b5b8f', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Buy', 'https://www.lorempixel.com/224/842', 'expense', '8a7f290b-6f65-4b75-acc4-059517791551'),
('8fe3c1ff-ceef-4800-bcc1-faa011aa4e80', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Cold', 'https://placeimg.com/526/668/any', 'expense', '606cd162-51ef-4be4-9056-7b0c9557b16d'),
('7055278a-1d91-41b4-9af6-5acc8f402216', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Want', 'https://placekitten.com/362/780', 'income', '593ca629-934d-42b0-8a73-19b9a75e90de'),
('6714eeb0-f6b5-4228-841a-8ad2a28d4f57', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Hear', 'https://dummyimage.com/103x126', 'income', '8a7f290b-6f65-4b75-acc4-059517791551'),
('2fa2f370-6f31-45f3-b477-e73504fd8707', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Evening', 'https://www.lorempixel.com/43/963', 'income', 'e46d61d1-6f3f-46e1-aa50-da22620be7ed'),
('2f519cc7-e8a3-4981-8f59-de2b1be0d954', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Organization', 'https://www.lorempixel.com/575/121', 'expense', 'df684eb1-0f8e-4a81-a5af-a75120b49736'),
('90e272ee-6e73-40d3-9ee1-12e2b9bf0ee5', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Wife', 'https://placeimg.com/879/207/any', 'expense', '606cd162-51ef-4be4-9056-7b0c9557b16d'),
('1b4dc198-8063-4048-9c93-5670c0519e8d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Improve', 'https://dummyimage.com/417x980', 'expense', '8a7f290b-6f65-4b75-acc4-059517791551'),
('504fbfa1-5b4e-418e-af15-ab9acd57fa07', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Sound', 'https://placekitten.com/677/388', 'expense', '8a7f290b-6f65-4b75-acc4-059517791551'),
('39bc7f9c-c31e-489d-acd3-ea310a936c39', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Because', 'https://dummyimage.com/969x881', 'expense', '593ca629-934d-42b0-8a73-19b9a75e90de'),
('fdd34267-1bc9-49a0-b96c-4352a508aa18', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Adult', 'https://dummyimage.com/9x769', 'expense', '606cd162-51ef-4be4-9056-7b0c9557b16d'),
('1fba21de-b0bc-4b9b-942c-6b0dba341306', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'True', 'https://dummyimage.com/712x905', 'expense', 'e46d61d1-6f3f-46e1-aa50-da22620be7ed'),
('cd758493-e054-45f2-8c06-5e540b78d36d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Bill', 'https://dummyimage.com/774x638', 'expense', 'e46d61d1-6f3f-46e1-aa50-da22620be7ed'),
('f61c5623-7b2a-4a2b-b9b6-d9af4326b94b', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Capital', 'https://dummyimage.com/818x422', 'income', 'df684eb1-0f8e-4a81-a5af-a75120b49736'),
('7ea9b8a5-1cb7-4236-be2c-e515f57442b6', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Among', 'https://placekitten.com/923/980', 'income', '593ca629-934d-42b0-8a73-19b9a75e90de');


INSERT INTO event (id, user_id, name, note, start_date, end_date) VALUES
('6f5351ff-b5e0-4a0f-ad2a-fc38294c63a1', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Monitored local structure', 'Relationship evening somebody his task send.', '2025-01-04', '2025-01-30'),
('2d8526de-14a1-452d-9822-3ae713925759', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Profound contextually-based encryption', 'Final story pass.', '2025-01-08', '2025-01-30'),
('9243ccc9-609d-4076-b11d-82a12e3f2a5d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Face-to-face well-modulated concept', 'Day member so.', '2025-04-28', '2025-07-16'),
('4ffadfd2-b4ce-44b4-b36c-72cd0f3cabbb', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Face-to-face solution-oriented approach', 'Grow our mind class.', '2025-01-06', '2025-02-16'),
('07cc863e-97f3-494a-8e2c-c73e74f8389c', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Open-source global complexity', 'Nature crime show green lose author into.', '2025-06-07', '2025-07-14'),
('7fbd0a8b-e200-4deb-a2cf-bb75008ac530', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Centralized content-based architecture', 'Begin hotel protect situation example.', '2025-06-14', '2025-06-15'),
('608ce19e-7235-4f5d-b572-eadc39eeb96e', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Fundamental 3rdgeneration access', 'Account attorney in article positive inside fight.', '2025-04-18', '2025-05-25'),
('bda4921f-bdfa-4565-b191-99e4e56c8ab5', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Managed impactful success', 'Stay song energy mention where final fill.', '2025-05-17', '2025-05-26'),
('9f52b247-e2f3-4235-84c5-06150cf34374', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Self-enabling demand-driven hardware', 'Realize front air decision figure suffer laugh.', '2025-03-03', '2025-06-05'),
('a5934ecd-e56c-4242-b61b-a1ebf54ad123', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Visionary systemic success', 'Movement tough method Mr up success science.', '2025-03-13', '2025-06-18'),
('b59cdd86-8056-41cf-9a53-4c67280b6359', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Triple-buffered fault-tolerant Graphical User Interface', 'Single fight form something often.', '2025-05-04', '2025-05-29'),
('5da93258-b33c-4916-a534-c54b8ba44d8d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Synergized multi-tasking monitoring', 'Even last side child particularly.', '2025-06-02', '2025-06-25'),
('442e138a-3643-4e91-9908-49147d5978c7', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Exclusive transitional monitoring', 'Fast until different house woman not.', '2025-01-11', '2025-05-05'),
('2e2ac691-7f41-408a-8ded-ec64c4422946', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Multi-tiered well-modulated website', 'Discover more discuss his southern.', '2025-03-12', '2025-05-25'),
('db34f47f-b975-4f0b-936e-0a475afc0dcd', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Distributed incremental Graphical User Interface', 'Through they thus like always red.', '2025-03-03', '2025-07-16'),
('644c86a6-8161-4af8-b51f-35a45eec8f37', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Upgradable maximized ability', 'Democrat such first look scientist.', '2025-06-03', '2025-06-10'),
('c93573c2-68d1-4640-adb5-552e19cc3749', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Optimized national archive', 'Remember rich scene avoid shoulder sound.', '2025-06-01', '2025-06-09'),
('d054b68e-c521-4686-8191-000e5f57b067', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Diverse user-facing hierarchy', 'Between past pattern go voice deep specific our.', '2025-03-18', '2025-06-11'),
('26286c41-9ed1-4d43-94f8-583aac592473', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Sharable explicit collaboration', 'Trade successful watch.', '2025-06-10', '2025-06-28'),
('de941895-6b60-43ad-9ef1-7658d899a5da', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Adaptive modular extranet', 'Next color top listen special trade hotel.', '2025-02-16', '2025-06-09');


INSERT INTO transaction (id, user_id, amount, date, description, category_id, type, event_id, recurrence, confirmed) VALUES
-- category_id '1fba21de...' (expense) → transaction type changed to 'expense'
('3b385a7e-1c41-43b1-b835-dfe37a5b6bd3', '5e967e16-0b2a-415c-8ac0-bf811452149a', 1907.58, '2025-05-14', 'Fish discussion grow federal someone response four.', '1fba21de-b0bc-4b9b-942c-6b0dba341306', 'expense', '2d8526de-14a1-452d-9822-3ae713925759', False, True),

('26ce6f3e-90ca-45da-8221-e47da141586e', '5e967e16-0b2a-415c-8ac0-bf811452149a', 2401.65, '2025-05-05', 'Easy color important compare hair trial.', '7ea9b8a5-1cb7-4236-be2c-e515f57442b6', 'income', 'd054b68e-c521-4686-8191-000e5f57b067', True, True),

('2ed87926-6c74-474a-aa91-960acde071c0', '5e967e16-0b2a-415c-8ac0-bf811452149a', 3122.57, '2025-05-13', 'Paper too son act full short.', '2f519cc7-e8a3-4981-8f59-de2b1be0d954', 'expense', '6f5351ff-b5e0-4a0f-ad2a-fc38294c63a1', True, True),

('171bcc24-11d8-4b82-9ee8-e893abc43e4e', '5e967e16-0b2a-415c-8ac0-bf811452149a', 3935.36, '2025-03-13', 'Participant necessary involve manage too.', 'fdd34267-1bc9-49a0-b96c-4352a508aa18', 'expense', 'de941895-6b60-43ad-9ef1-7658d899a5da', True, True),

('faceb13e-484f-41a6-a6c4-40d8e6c6375f', '5e967e16-0b2a-415c-8ac0-bf811452149a', 2044.73, '2025-01-22', 'We spring impact data rich hundred ready.', 'e46d61d1-6f3f-46e1-aa50-da22620be7ed', 'income', 'de941895-6b60-43ad-9ef1-7658d899a5da', False, True),

('2c1fd3fa-dd03-4c78-8f63-a3838f04bfe6', '5e967e16-0b2a-415c-8ac0-bf811452149a', 4241.29, '2025-03-04', 'Section increase make face.', 'df684eb1-0f8e-4a81-a5af-a75120b49736', 'income', '26286c41-9ed1-4d43-94f8-583aac592473', True, True),

('0d719eba-55aa-4a3e-a4ba-134e0c1a9d3c', '5e967e16-0b2a-415c-8ac0-bf811452149a', 4480.41, '2025-04-29', 'East sign resource candidate policy.', '7ea9b8a5-1cb7-4236-be2c-e515f57442b6', 'income', '26286c41-9ed1-4d43-94f8-583aac592473', False, True),

('7e556290-6f17-4638-887b-839e48791c23', '5e967e16-0b2a-415c-8ac0-bf811452149a', 1903.09, '2025-03-29', 'Firm race instead.', '7ea9b8a5-1cb7-4236-be2c-e515f57442b6', 'income', '2e2ac691-7f41-408a-8ded-ec64c4422946', True, True),

('67567550-5e11-4b66-af88-8f4dc5fe50c5', '5e967e16-0b2a-415c-8ac0-bf811452149a', 142.78, '2025-02-05', 'History short assume training development example model up.', '504fbfa1-5b4e-418e-af15-ab9acd57fa07', 'expense', 'db34f47f-b975-4f0b-936e-0a475afc0dcd', False, True),

('eb04d115-d394-411d-81e9-48bada65c8e9', '5e967e16-0b2a-415c-8ac0-bf811452149a', 877.01, '2025-01-18', 'Pull build write cell member down whatever central.', '2f519cc7-e8a3-4981-8f59-de2b1be0d954', 'expense', '608ce19e-7235-4f5d-b572-eadc39eeb96e', False, True),

('65a5a7de-5658-4db8-8d3f-c31d04f1f1f7', '5e967e16-0b2a-415c-8ac0-bf811452149a', 3169.77, '2025-01-08', 'Performance its huge development author herself.', '593ca629-934d-42b0-8a73-19b9a75e90de', 'income', 'b59cdd86-8056-41cf-9a53-4c67280b6359', True, True),

('a5f6551c-775a-45db-b4b8-e94b080c9e4e', '5e967e16-0b2a-415c-8ac0-bf811452149a', 2709.98, '2025-04-30', 'Course or actually third activity success.', '6714eeb0-f6b5-4228-841a-8ad2a28d4f57', 'income', '608ce19e-7235-4f5d-b572-eadc39eeb96e', False, True),

('48e09c77-f59c-4730-afde-db4f4080e372', '5e967e16-0b2a-415c-8ac0-bf811452149a', 1527.39, '2025-01-04', 'Capital couple event wife treatment message.', 'cd758493-e054-45f2-8c06-5e540b78d36d', 'expense', '6f5351ff-b5e0-4a0f-ad2a-fc38294c63a1', True, True),

('d70c0eb2-3771-44f6-82ce-b86978708a47', '5e967e16-0b2a-415c-8ac0-bf811452149a', 650.41, '2025-01-15', 'Nor stay in.', '6714eeb0-f6b5-4228-841a-8ad2a28d4f57', 'income', '9243ccc9-609d-4076-b11d-82a12e3f2a5d', True, True),

('79c8961f-94bd-4081-bbe1-673af18a0c26', '5e967e16-0b2a-415c-8ac0-bf811452149a', 3150.95, '2025-04-21', 'Republican development activity month happy.', '504fbfa1-5b4e-418e-af15-ab9acd57fa07', 'expense', 'de941895-6b60-43ad-9ef1-7658d899a5da', True, True),

('34d44c61-ccc3-4af0-8851-8da713b0071d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 4322.32, '2025-05-06', 'Challenge remember success ahead quickly myself.', '39bc7f9c-c31e-489d-acd3-ea310a936c39', 'expense', 'de941895-6b60-43ad-9ef1-7658d899a5da', False, True),

('61e67cc1-4342-4b47-abe9-49846c3285a7', '5e967e16-0b2a-415c-8ac0-bf811452149a', 2771.42, '2025-02-23', 'Partner radio ten window.', '6714eeb0-f6b5-4228-841a-8ad2a28d4f57', 'income', '9f52b247-e2f3-4235-84c5-06150cf34374', False, True),

('679d38f0-6ebf-4b4d-9748-63bdf4c72402', '5e967e16-0b2a-415c-8ac0-bf811452149a', 303.34, '2025-05-20', 'Support decade charge.', '7055278a-1d91-41b4-9af6-5acc8f402216', 'income', 'de941895-6b60-43ad-9ef1-7658d899a5da', False, True),

('ea5569db-da3d-42b9-a689-10d41515419d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 4689.63, '2025-04-29', 'Member read within surface major.', '6714eeb0-f6b5-4228-841a-8ad2a28d4f57', 'income', '26286c41-9ed1-4d43-94f8-583aac592473', True, True),

('2f95db51-02c4-4574-8411-fad0e7da695f', '5e967e16-0b2a-415c-8ac0-bf811452149a', 197.86, '2025-02-13', 'West interesting Republican today.', '606cd162-51ef-4be4-9056-7b0c9557b16d', 'income', '5da93258-b33c-4916-a534-c54b8ba44d8d', True, True);


INSERT INTO debt (id, user_id, description, type, start_date, expiration_date, interest_rate, amount, taken_from) VALUES
('0702e4aa-ff96-4dcc-8656-bfef5fbf9131', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Scientist foot song somebody way sign garden energy.', 'personal', '2025-05-08', '2026-03-04', 7.63, 14092.76, 'Navarro, Brown and Rice'),
('217abb92-b8ce-4528-b4a9-196a814c1d70', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Financial page network month relationship organization news.', 'bank', '2025-02-28', '2025-09-10', 2.18, 18855.73, 'Hart, Alexander and Deleon'),
('ec62f988-d86d-4bf2-86aa-b51428486606', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Sister team interesting.', 'personal', '2025-06-08', '2026-03-10', 8.20, 10800.70, 'Sullivan Group'),
('ece01dd7-3a00-4d0b-97a4-4fdc6fae3bc8', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Rate evening allow difference before case house.', 'bank', '2025-02-15', '2025-09-16', 5.90, 16220.11, 'Jordan, Hicks and Pena'),
('962f4f6d-ec6b-4c45-8a1a-47f03f799aba', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Foot sell certainly customer head million.', 'bank', '2025-05-28', '2026-03-25', 8.64, 10968.32, 'Russell, Ray and Strong'),
('bd408e08-23fd-4e5d-8ed4-d959d1748fa6', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Pick throughout individual western high.', 'bank', '2025-05-18', '2025-12-21', 8.43, 13927.92, 'Hansen Group'),
('bea5f45a-e5eb-4fb1-adb5-c9ca4f481990', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Exactly ask deal join.', 'personal', '2025-02-07', '2025-11-23', 5.15, 11710.40, 'Hudson, Hall and Smith'),
('75f2bceb-c217-4f42-96f0-54cd12f1a319', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Customer about four successful.', 'bank', '2025-05-29', '2026-04-19', 5.89, 9365.19, 'Tanner, Pierce and West'),
('dca22eb7-b5a0-4ed9-a5e9-7e89c9bad7c2', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Forget catch foot.', 'personal', '2025-03-23', '2025-09-08', 1.28, 9817.37, 'Tran, Johnson and Harrison'),
('88db0300-c978-4e8a-ab28-0825e2a66ba5', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Country would season care apply community.', 'bank', '2025-01-31', '2025-07-23', 8.16, 8383.33, 'Mcknight-Melendez'),
('4e71a3ad-862d-4293-aef0-250795c958c4', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Chair strong shake character fire source.', 'personal', '2025-05-07', '2025-07-28', 4.05, 13792.37, 'Fischer Ltd'),
('72a046c5-2c54-4cc5-82ef-9a741bc645b1', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Tv Congress task tree garden throughout.', 'personal', '2025-01-16', '2026-01-25', 5.71, 14997.57, 'Elliott-Graham'),
('f62774c4-da23-4d6b-87b3-a69543c5e633', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Than election single indeed.', 'personal', '2025-02-27', '2025-10-14', 5.20, 16087.63, 'Atkins, Garcia and Shields'),
('0d767057-289c-43e3-90db-3bbb8e08dfff', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Arrive major really science yet.', 'bank', '2025-02-09', '2025-10-05', 4.96, 9716.47, 'Morris, Frey and Hunter'),
('31efe4f0-7609-4f9a-aac6-516cf63761b0', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Soldier laugh step require charge toward bit speech.', 'personal', '2025-05-13', '2026-03-06', 8.90, 4705.11, 'Lewis, Meyers and Gordon'),
('457c182e-f7b7-43f0-9bc0-3b4a726a0e16', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Certainly since development same add behavior south.', 'bank', '2025-05-19', '2026-02-06', 3.89, 6592.85, 'Curry, Harvey and Bowman'),
('c71c2bf8-5853-4c79-9874-c4125465af3d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Produce politics season citizen writer.', 'bank', '2025-01-06', '2026-04-05', 5.22, 12796.23, 'Henderson PLC'),
('93db05a7-68ee-400c-a729-531b51da62a0', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Back bed least third.', 'personal', '2025-01-17', '2025-12-13', 8.82, 8868.08, 'Miller-Johnson'),
('b2584a85-b2fb-4d86-a436-1a2b57b3d587', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Charge morning may bank full sense role company.', 'personal', '2025-03-11', '2026-05-19', 4.52, 5597.15, 'Joyce, Webb and Riddle'),
('fa739330-29f2-4e49-944b-64f947dd8f96', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Machine despite picture health nothing.', 'bank', '2025-06-22', '2026-01-20', 5.62, 11064.87, 'Palmer, Bernard and Mitchell');


INSERT INTO saving (id, user_id, description, start_amount, target_amount, start_date, end_date, expired, completed) VALUES
('ee2cc58b-54ce-4a5e-8fca-92e9ca4e199a', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Once attack stop same agree imagine.', 2727.54, 5313.69, '2025-04-09', '2026-03-04', TRUE, TRUE),
('a4fc8ef0-fff2-4c51-8a72-011090438fb3', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Treat sell others.', 7010.02, 14998.92, '2025-01-06', '2025-05-03', FALSE, TRUE),
('af46e5e7-5061-4c0c-a202-ad86ec5f9c03', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Feeling particular senior money.', 203.75, 4101.42, '2025-03-09', '2026-04-22', FALSE, FALSE),
('71f5bcaf-e4c0-4c52-a00d-098bd0dc9b68', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Smile wrong similar against.', 1235.55, 2750.29, '2025-05-18', '2026-02-01', TRUE, TRUE),
('7cd8a781-dac2-4ca5-b98e-4e75d59dbb64', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Beyond in trade how.', 4703.28, 8811.64, '2025-01-19', '2025-06-27', TRUE, FALSE),
('edb07a69-cd2a-49c0-88cd-3cdedbe543a3', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Central why friend situation bit concern.', 5972.00, 7243.34, '2025-03-03', '2025-04-19', TRUE, FALSE),
('1c38a5bc-5ad3-455b-b5f4-c75d43bd8cf0', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Respond any include where.', 9590.31, 18432.30, '2025-01-09', '2026-02-20', FALSE, FALSE),
('10a5f062-fa2b-4dba-a533-40dc26e3527e', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Open huge bring.', 8392.52, 10473.67, '2025-06-22', '2025-10-20', TRUE, FALSE),
('a37a3e3f-3e38-47c2-85ff-41e60804d95d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Staff radio imagine leg near film.', 410.46, 7094.44, '2025-06-10', '2025-06-28', FALSE, FALSE),
('630a64fb-2f8f-4508-af0a-45ca4aee5866', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Information piece town treatment us again blood.', 2162.08, 4257.45, '2025-06-11', '2025-08-23', FALSE, TRUE),
('71985b91-93e5-4eba-a192-18bcfd176f7b', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Beautiful itself cover partner early concern church son.', 3359.26, 10132.74, '2025-01-26', '2026-01-06', TRUE, TRUE),
('73f79725-b1e5-4e82-a1b8-0e0575e681b0', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Newspaper determine business spend speech quality current.', 1199.06, 8333.57, '2025-03-04', '2026-06-21', FALSE, TRUE),
('9768b97e-eb73-49bd-8247-cc7c8a7c0a5d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Away remember on artist might feel hot.', 2455.44, 7124.96, '2025-04-21', '2026-05-06', FALSE, FALSE),
('0f64398e-664b-4988-85ae-e4bb5abf37d4', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Think give role red.', 2058.22, 8848.58, '2025-06-17', '2025-11-26', TRUE, TRUE),
('59414c41-783a-4e1d-910f-de8ee4f5d1da', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'General conference town new fly indicate.', 6829.73, 14696.07, '2025-02-25', '2025-10-07', FALSE, FALSE),
('cd36ca1b-e1ef-4074-af2c-4e0a18073575', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Message both instead.', 7915.27, 10440.59, '2025-01-27', '2025-08-13', FALSE, TRUE),
('86bbe903-23f2-48f3-99ef-5047a2ed4114', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Mind risk good reveal mouth around election event.', 7557.14, 10986.97, '2025-04-27', '2026-03-13', TRUE, TRUE),
('972e2887-af93-493d-913e-fe3f340a6035', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Specific main agreement various ability.', 1919.72, 3414.50, '2025-02-01', '2026-03-24', FALSE, TRUE),
('065880ce-4976-4b68-87c1-cf5977814d10', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Responsibility several attack word break against blue.', 2969.62, 8832.32, '2025-05-01', '2025-10-05', FALSE, TRUE),
('ec6bd520-21b5-4ea5-a090-e87a6be02954', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'Decide hot good somebody partner.', 4107.93, 5403.83, '2025-03-28', '2025-06-08', FALSE, FALSE);

INSERT INTO budget (id, user_id, category_id, start_date, end_date, goal_amount, expired, amount_exceeded, icon_url) VALUES
('24a850b8-0044-4da3-a418-24394c72005d', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'c3d9bd4e-4447-4c57-9a9f-da08ac1b5b8f', '2025-04-10', '2025-09-07', 4478.67, FALSE, FALSE, 'https://www.lorempixel.com/993/336'),
('62ce96de-2ec1-477e-8f87-0cf57cea0cf8', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'cd758493-e054-45f2-8c06-5e540b78d36d', '2025-05-10', '2025-05-29', 1704.40, TRUE, FALSE, 'https://placekitten.com/109/129'),
('38b6d8eb-89f9-4ef2-984f-0da36e3345b1', '5e967e16-0b2a-415c-8ac0-bf811452149a', '6714eeb0-f6b5-4228-841a-8ad2a28d4f57', '2025-06-12', '2025-08-08', 4730.44, TRUE, TRUE, 'https://placeimg.com/968/137/any'),
('f09e21a5-fc5f-4ddf-a728-d5fc59adcc55', '5e967e16-0b2a-415c-8ac0-bf811452149a', '39bc7f9c-c31e-489d-acd3-ea310a936c39', '2025-05-18', '2025-06-22', 4414.44, TRUE, TRUE, 'https://dummyimage.com/771x729'),
('22d2e17f-179c-4170-8114-1963def5db15', '5e967e16-0b2a-415c-8ac0-bf811452149a', '2f519cc7-e8a3-4981-8f59-de2b1be0d954', '2025-05-18', '2025-08-02', 4503.46, TRUE, FALSE, 'https://dummyimage.com/421x144'),
('24f7ba9a-a82c-44cb-9a8f-45ce8a30b028', '5e967e16-0b2a-415c-8ac0-bf811452149a', '504fbfa1-5b4e-418e-af15-ab9acd57fa07', '2025-03-24', '2025-09-16', 1812.39, FALSE, FALSE, 'https://placekitten.com/349/465'),
('8045bdef-2e24-4398-9d92-4bf30b6840d9', '5e967e16-0b2a-415c-8ac0-bf811452149a', '2fa2f370-6f31-45f3-b477-e73504fd8707', '2025-04-14', '2025-05-29', 1593.43, FALSE, TRUE, 'https://www.lorempixel.com/205/865'),
('9d4068db-a226-4f2f-b336-d3174728e835', '5e967e16-0b2a-415c-8ac0-bf811452149a', '7ea9b8a5-1cb7-4236-be2c-e515f57442b6', '2025-01-28', '2025-07-12', 4733.53, TRUE, TRUE, 'https://placekitten.com/691/936'),
('62d491ed-2ffd-497e-999d-ecd8dd5c4da9', '5e967e16-0b2a-415c-8ac0-bf811452149a', '8fe3c1ff-ceef-4800-bcc1-faa011aa4e80', '2025-02-17', '2025-04-25', 4672.77, TRUE, FALSE, 'https://www.lorempixel.com/344/543'),
('81a3b40b-bade-498c-80c5-00a49f8efafa', '5e967e16-0b2a-415c-8ac0-bf811452149a', '1b4dc198-8063-4048-9c93-5670c0519e8d', '2025-01-21', '2025-05-04', 1670.15, FALSE, FALSE, 'https://dummyimage.com/542x875'),
('030d7158-ce7c-4c0e-a8b1-94c310fdc5d6', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'fdd34267-1bc9-49a0-b96c-4352a508aa18', '2025-01-09', '2025-05-28', 3857.58, TRUE, TRUE, 'https://placekitten.com/664/227'),
('20d5ca6a-2292-467d-a943-5b4f1f92ee9f', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'e46d61d1-6f3f-46e1-aa50-da22620be7ed', '2025-02-19', '2025-02-19', 4829.36, TRUE, FALSE, 'https://placeimg.com/653/189/any'),
('a714226d-68a2-4426-a16a-7b7561acdee5', '5e967e16-0b2a-415c-8ac0-bf811452149a', '606cd162-51ef-4be4-9056-7b0c9557b16d', '2025-05-28', '2025-09-02', 2886.09, TRUE, FALSE, 'https://placeimg.com/414/653/any'),
('5fffb1f6-9e09-4f1d-80a3-70471dd1ef79', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'df684eb1-0f8e-4a81-a5af-a75120b49736', '2025-05-21', '2025-06-30', 1808.15, FALSE, FALSE, 'https://www.lorempixel.com/963/704'),
('3ee73d42-cd6a-43f9-a2c1-861bec979cbf', '5e967e16-0b2a-415c-8ac0-bf811452149a', '593ca629-934d-42b0-8a73-19b9a75e90de', '2025-04-14', '2025-08-30', 509.81, FALSE, TRUE, 'https://www.lorempixel.com/47/712'),
('21862502-dee8-4ad2-8e56-3f471a2ed99e', '5e967e16-0b2a-415c-8ac0-bf811452149a', 'f61c5623-7b2a-4a2b-b9b6-d9af4326b94b', '2025-05-07', '2025-06-16', 4544.19, FALSE, TRUE, 'https://placekitten.com/11/101'),
('8f102ff3-965f-4991-b0e0-4eaa434635a2', '5e967e16-0b2a-415c-8ac0-bf811452149a', '7055278a-1d91-41b4-9af6-5acc8f402216', '2025-05-03', '2025-08-03', 4599.38, FALSE, FALSE, 'https://placekitten.com/29/495'),
('21c1d458-e116-4cf8-85b7-2a50716d269b', '5e967e16-0b2a-415c-8ac0-bf811452149a', '8a7f290b-6f65-4b75-acc4-059517791551', '2025-05-13', '2025-05-27', 3117.55, TRUE, TRUE, 'https://dummyimage.com/82x15'),
('80812bdb-5349-4bee-98c6-fb3c72cc50d9', '5e967e16-0b2a-415c-8ac0-bf811452149a', '90e272ee-6e73-40d3-9ee1-12e2b9bf0ee5', '2025-05-23', '2025-06-07', 4057.00, TRUE, TRUE, 'https://placekitten.com/590/933');

