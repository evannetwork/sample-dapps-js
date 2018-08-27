/*
  Copyright (c) 2018-present evan GmbH.

  Licensed under the Apache License, Version 2.0 (the "License");
  you may not use this file except in compliance with the License.
  You may obtain a copy of the License at

      http://www.apache.org/licenses/LICENSE-2.0

  Unless required by applicable law or agreed to in writing, software
  distributed under the License is distributed on an "AS IS" BASIS,
  WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
  See the License for the specific language governing permissions and
  limitations under the License.
*/

import * as CoreBundle from 'bcc';
import { loading, } from 'dapp-browser';

function createElement(container) {
  // create a new container for the dapp to load
  const helloWorldEl = document.createElement(`div`);
  helloWorldEl.id = 'helloworldjs';
  helloWorldEl.className += ' evan-dapp hello-world-js';
  helloWorldEl.style.cssText = 'contain: unset !important;';
  container.appendChild(helloWorldEl);

  return helloWorldEl;
}

async function loadData() {
  const runtime = CoreBundle.CoreRuntime;
  const data = { };
  
  // get contract id from current url or from parent
  let contractId = window.location.href.split('/').pop();

  if (!contractId || contractId.indexOf('0x') !== 0) {
    contractId = '';
  } else {
    // load opened contract
    const contract = await runtime.description.loadContract(contractId);

    // load sample contract data
    data['contract-id'] = contractId;
    data['owner'] = await contract.methods.owner().call();
    data['contract-methods'] = Object.keys(contract.methods).join(', ');
    data['sample1'] = await contract.methods.greet().call();
    data['sample2'] = await runtime.executor.executeContractCall(contract, 'greet');
  }

  // load contract description
  const description = await runtime.description.getDescription(
    contractId || 'dashboard.evan',
    '0x001De828935e8c7e4cb56Fe610495cAe63fb2612'
  );

  data['description'] = JSON.stringify(
    description,
    null,
    2
  );;

  return data;
}

export async function startDApp(container, dbcpName) {
  // hide dapp-browser loading
  loading.finishDAppLoading();

  const helloWorldEl = createElement(container);
  const data = await loadData();

  helloWorldEl.innerHTML = `
    <h2>Hello World JS</h2>
    <table>
      <thead>
        <tr>
          <th>Field</th>
          <th>Value</th>
        </tr>
      </thead>
      <tbody>
        <tr>
          <td>Contract ID</td>
          <td>${ data['contract-id'] || '---' }</td>
        </tr>
        <tr>
          <td>Owner</td>
          <td>${ data['owner'] || '---' }</td>
        </tr>
        <tr>
          <td>Sample 1</td>
          <td>${ data['sample1'] || '---' }</td>
        </tr>
        <tr>
          <td>Sample 2</td>
          <td>${ data['sample2'] || '---' }</td>
        </tr>
        <tr>
          <td>Contract Methods</td>
          <td>
            <textarea rows="10">${ data['contract-methods'] || '---' }</textarea>
          </td>
        </tr>
        <tr>
          <td>Description</td>
          <td>
            <textarea rows="30">${ data['description'] || '---' }</textarea>
          </td>
        </tr>
      </tbody>
    </table>
  `;
}
