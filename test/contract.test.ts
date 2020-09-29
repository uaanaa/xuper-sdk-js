/**
 * @file (contract)
 * Created by baidu on 2020/7/20
 */

jest.setTimeout(100000000);

import XuperSDK, {Cryptography, Language} from '../src';
import {isBrowser} from '../src/utils';

isBrowser && require('whatwg-fetch');

const
    node = process.env.HOST || 'http://localhost:8098',
    chain = process.env.CHAIN || 'xuper',
    mnemonic = '玉 脸 驱 协 介 跨 尔 籍 杆 伏 愈 即',
    address = 'nuSMPvo6UUoTaT8mMQmHbfiRbJNbAymGh';


describe('Xuper SDK Contract：', () => {
    test('create an new contact account', async () => {
        const xsdk = new XuperSDK({
            node,
            chain
        });

        xsdk.retrieve(
            mnemonic,
            Language.SimplifiedChinese,
            Cryptography.EccFIPS,
            true
        );

        const execStruct = await xsdk.createContractAccount(
            parseInt('1234567890' + (~~(Math.random() * (999999 - 100000) + 100000).toString()))
        );
        const result = await xsdk.postTransaction(execStruct.transaction);
        expect(result.header).toHaveProperty('logid');
        expect(result.header).not.toHaveProperty('error');
    });

    test('get the address contract accounts should return contarct account list', async () => {
        const xsdk = new XuperSDK({
            node,
            chain
        });

        xsdk.retrieve(
            mnemonic,
            Language.SimplifiedChinese,
            Cryptography.EccFIPS,
            true
        );

        const result = await xsdk.getContractAccounts();
        console.warn(result);
        expect(result.header).toHaveProperty('logid');
        expect(result).toHaveProperty('bcname');
        expect(result).toHaveProperty('account');
    });

    test('get the contract list of current account should return contracts', async () => {
        const xsdk = new XuperSDK({
            node,
            chain
        });

        xsdk.retrieve(
            mnemonic,
            Language.SimplifiedChinese,
            Cryptography.EccFIPS,
            true
        );

        const result = await xsdk.getContracts(address);
        console.log(JSON.stringify(result, null, 4));
        expect(result.header).toHaveProperty('logid');
    });

    test('deploy new wasm contract should return transaction info and result of post', async () => {
        const xsdk = new XuperSDK({
            node,
            chain
        });

        xsdk.retrieve(
            mnemonic,
            Language.SimplifiedChinese,
            Cryptography.EccFIPS,
            true
        );

        const codeBuf: string[] = [];

        if (isBrowser) {
            // @ts-ignore
            window.file.forEach(n => codeBuf.push(String.fromCharCode(n)));
        } else {
            const fs = require('fs');
            const wasm = Uint8Array.from(fs.readFileSync(`${__dirname}/wasm/counter.wasm`));
            wasm.forEach(n => codeBuf.push(String.fromCharCode(n)));
        }

        const contractName = `counter${~~(Math.random() * 10 ** 3 - 10 ** 3) + 10 ** 3}`;

        console.error(contractName);

        const result = await xsdk.deployWasmContract(
            'XC1234567890598143@xuper',
            contractName,
            codeBuf.join(''),
            'c', {
                creator: address
            }
        );

        console.warn(JSON.stringify(result, null, 4));

        const r = await xsdk.postTransaction(result.transaction);

        console.warn(r);
    });

    test('deploy ne result of post', async () => {
        const xsdk = new XuperSDK({
            node,
            chain
        });

        xsdk.retrieve(
            mnemonic,
            Language.SimplifiedChinese,
            Cryptography.EccFIPS,
            true
        );

        const codeBuf: string[] = [];

        if (isBrowser) {
            // @ts-ignore
            window.file.forEach(n => codeBuf.push(String.fromCharCode(n)));
        } else {
            const fs = require('fs');
            const wasm = Uint8Array.from(fs.readFileSync(`${__dirname}/wasm/counter.wasm`));
            wasm.forEach(n => codeBuf.push(String.fromCharCode(n)));
        }

        const contractName = `counter${~~(Math.random() * 10 ** 3 - 10 ** 3) + 10 ** 3}`;

        console.error(contractName);

        const result = await xsdk.deployWasmContract(
            'XC1234567890598143@xuper',
            'counter500',
            codeBuf.join(''),
            'c', {
                creator: address
            },
            true
        );

        console.warn(JSON.stringify(result, null, 4));

        const r = await xsdk.postTransaction(result.transaction);

        console.warn(r);
    });

    test('invoke contract', async () => {
        const xsdk = new XuperSDK({
            node,
            chain
        });

        const account = xsdk.retrieve(
            mnemonic,
            Language.SimplifiedChinese,
            Cryptography.EccFIPS,
            true
        );

        const {transaction} =
            await xsdk.invokeContarct('counter500', 'increase', 'wasm', {}, account);

        console.warn(JSON.stringify(transaction, null, 4));

        const result = await xsdk.postTransaction(transaction);

        expect(result.header).toHaveProperty('logid');
        expect(result.header).not.toHaveProperty('error');
    });

    // Todo: Upgrade
});
