import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react';
import axios from 'axios';
import { MemoryRouter, Routes, Route } from 'react-router-dom';
import '@testing-library/jest-dom/extend-expect';
import toast from 'react-hot-toast';
import Login from './Login';

import React from "react";
import Layout from "../../components/Layout";
import UserMenu from "../../components/UserMenu";
import { useAuth } from "../../context/auth";

import React from "react";
import { screen, render } from "@testing-library/react";
import { MemoryRouter } from "react-router-dom";
import "@testing-library/jest-dom/extend-expect";
import Dashboard from "./Dashboard";
import { useAuth } from "../../context/auth";